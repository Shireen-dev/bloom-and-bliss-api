# Bloom & Bliss API

A RESTful back end for the [Bloom & Bliss](https://shireen-dev.github.io/Bloom-and-bliss/) flower bouquet e-commerce front end, built with **Node.js** and **Express**. It provides authentication, full CRUD for the product catalog, a per-user shopping cart, and an order/checkout flow.

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Runtime | Node.js | JavaScript across front end and back end |
| Framework | Express.js | Minimal, well-documented, industry-standard for REST APIs |
| Auth | JSON Web Tokens (`jsonwebtoken`) + `bcryptjs` for password hashing | Stateless auth, no server-side session storage needed |
| Database | A single JSON file (`data/db.json`), read/written through `src/db.js` | Zero external services to install (no MySQL/Postgres/Mongo server) — the whole project runs with just `node` and `npm install`. It plays the role of a lightweight non-relational data store: `products`, `users`, `carts`, and `orders` are stored as collections, exactly like documents in a NoSQL database |
| Testing | Jest + Supertest | Runs real HTTP requests against the Express app in-memory, no separate server needed to test |

## Project structure

```
bloom-and-bliss-api/
├── server.js                  # entry point — starts the HTTP server
├── package.json
├── .env.example                # copy to .env and fill in
├── data/
│   └── db.json                  # the "database" — seeded with 20 bouquets
├── src/
│   ├── app.js                    # Express app setup + route mounting
│   ├── db.js                      # tiny JSON file read/write helper
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── productsController.js
│   │   ├── cartController.js
│   │   └── ordersController.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── products.routes.js
│   │   ├── cart.routes.js
│   │   └── orders.routes.js
│   ├── middleware/
│   │   ├── auth.js                # verifies JWT, attaches req.user
│   │   └── errorHandler.js        # 404 + centralized error responses
│   └── utils/
│       ├── token.js                # sign/verify JWT
│       └── validate.js             # simple field/email validation
└── tests/
    ├── auth.test.js
    ├── products.test.js
    └── cart-and-orders.test.js
```

## Setup & run instructions

**Requirements:** [Node.js](https://nodejs.org) v18 or newer (includes `npm`).

1. Unzip the project and open the folder in a terminal:
   ```
   cd bloom-and-bliss-api
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Create your local environment file:
   ```
   cp .env.example .env
   ```
   (On Windows PowerShell: `copy .env.example .env`)
   Open `.env` and set `JWT_SECRET` to any long random string.
4. Start the server:
   ```
   npm start
   ```
   You should see:
   ```
   Bloom & Bliss API running at http://localhost:4000
   Health check: http://localhost:4000/api/health
   ```
5. Confirm it's working by opening `http://localhost:4000/api/health` in a browser, or with curl:
   ```
   curl http://localhost:4000/api/health
   ```

### Running the tests
```
npm test
```
This runs the Jest test suite (auth, products, cart, and full checkout flow) against the Express app directly — no need for the server to already be running.

### Connecting the Bloom & Bliss front end
The existing front end currently reads products from a local `PRODUCTS` array and manages the cart in `localStorage`. To connect it to this API instead:
1. Replace the hardcoded `PRODUCTS` array in `js/products.js` with a `fetch("http://localhost:4000/api/products")` call on page load.
2. Replace the `localStorage`-based functions in `js/cart.js` and `js/auth.js` with calls to `/api/cart` and `/api/auth/*`, sending the JWT returned at login in an `Authorization: Bearer <token>` header on every request.
3. Enable CORS is already handled server-side (see `src/app.js`), so the two can run on different ports (e.g. front end on 5500, API on 4000) during local development.

## API Documentation

All endpoints are prefixed with `/api`. Protected endpoints require an `Authorization: Bearer <token>` header, obtained from `/api/auth/register` or `/api/auth/login`.

### Auth

| Method | Endpoint | Auth | Body | Success response |
|---|---|---|---|---|
| POST | `/api/auth/register` | No | `{ "name", "email", "password" }` | `201` `{ token, user }` |
| POST | `/api/auth/login` | No | `{ "email", "password" }` | `200` `{ token, user }` |
| GET | `/api/auth/me` | Yes | — | `200` `{ user }` |

**Errors:** `400` missing/invalid fields, `409` email already registered, `401` invalid credentials or missing/expired token.

### Products

| Method | Endpoint | Auth | Body | Success response |
|---|---|---|---|---|
| GET | `/api/products` | No | — (optional `?category=Romantic` query) | `200` `{ count, products[] }` |
| GET | `/api/products/:id` | No | — | `200` `{ product }` |
| POST | `/api/products` | Yes | `{ name, price, category, tagline?, description?, flowers?, stemCount?, size?, image? }` | `201` `{ product }` |
| PUT | `/api/products/:id` | Yes | any subset of the fields above | `200` `{ product }` |
| DELETE | `/api/products/:id` | Yes | — | `200` `{ message, product }` |

**Errors:** `400` missing/invalid fields, `404` product not found, `401` missing/invalid token on write operations.

### Cart (per signed-in user)

| Method | Endpoint | Auth | Body | Success response |
|---|---|---|---|---|
| GET | `/api/cart` | Yes | — | `200` `{ items[], total }` |
| POST | `/api/cart` | Yes | `{ productId, quantity? }` (default quantity 1) | `201` `{ items[] }` |
| PUT | `/api/cart/:productId` | Yes | `{ quantity }` (`0` removes the item) | `200` `{ items[] }` |
| DELETE | `/api/cart/:productId` | Yes | — | `200` `{ items[] }` |
| DELETE | `/api/cart` | Yes | — (clears the whole cart) | `200` `{ items: [] }` |

**Errors:** `400` invalid quantity, `404` product or cart item not found, `401` missing/invalid token.

### Orders

| Method | Endpoint | Auth | Body | Success response |
|---|---|---|---|---|
| POST | `/api/orders` | Yes | `{ shipping: { name, address, city, zip, phone } }` — builds the order from the caller's current cart, then empties it | `201` `{ order }` |
| GET | `/api/orders` | Yes | — | `200` `{ count, orders[] }` (only the caller's own orders) |
| GET | `/api/orders/:id` | Yes | — | `200` `{ order }` |

**Errors:** `400` empty cart or missing shipping fields, `403` trying to view another user's order, `404` order not found, `401` missing/invalid token.

### Example request/response

```
POST /api/auth/register
Content-Type: application/json

{ "name": "Priya Rao", "email": "priya@example.com", "password": "flowerpower1" }
```
```
201 Created
{
  "token": "eyJhbGciOi...",
  "user": { "id": 1, "name": "Priya Rao", "email": "priya@example.com" }
}
```

```
POST /api/cart
Authorization: Bearer eyJhbGciOi...
Content-Type: application/json

{ "productId": 3, "quantity": 2 }
```
```
201 Created
{
  "items": [
    {
      "productId": 3,
      "quantity": 2,
      "product": { "id": 3, "name": "Velvet Peony", "price": 68.99, ... },
      "subtotal": 137.98
    }
  ]
}
```

## Security & best practices applied
- Passwords are never stored in plain text — hashed with bcrypt (10 salt rounds) before saving.
- Auth uses short-lived, signed JWTs rather than storing session state server-side.
- All write operations (create/update/delete products, cart mutations, checkout) require a valid token.
- A user can only view their own orders — verified server-side, not just hidden in the UI.
- Centralized error-handling middleware returns consistent JSON error shapes and logs server-side without leaking stack traces to the client.
- Input validation on every write endpoint (required fields, email format, password length, numeric checks) before touching the database.

## Known limitations (by design, for this stage of the project)
- The JSON-file database is fine for development and demos but is not safe for concurrent production traffic (no locking/transactions). A production deployment should swap `src/db.js` for a real database client (e.g. PostgreSQL via `pg`, or MongoDB via `mongoose`) behind the same function signatures (`readDB`/`writeDB`), so the controllers would not need to change.
- There is no role-based access control yet — any authenticated user can create/edit/delete products. A future iteration would add an `isAdmin` flag on the user and restrict product-write routes to admins only.
- Rate limiting and request logging (e.g. `express-rate-limit`, `morgan`) were left out to keep the dependency list minimal, but would be straightforward additions.
