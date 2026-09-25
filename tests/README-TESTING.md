# Testing Strategy — Bloom & Bliss API

## Overview
This project uses **Jest** and **Supertest** for automated testing of the back-end
REST API. Tests are split into unit-style checks of individual endpoints and
integration-style checks that verify authentication, authorization, and error
handling across the app.

## Test Files
- `tests/auth.test.js` — registration and login (valid + duplicate/invalid cases)
- `tests/products.test.js` — product catalog retrieval, filtering, single-product lookup
- `tests/cart-and-orders.test.js` — cart and order creation flows for a logged-in user
- `tests/edge-cases.test.js` — negative/edge cases across auth, products, cart, and orders
  (missing fields, wrong passwords, missing/invalid tokens, non-existent IDs)

## How to Run

All 4 suites (30 tests total) should report **PASS**.

## Testing Strategy
- **Unit-level checks**: individual endpoints tested in isolation for correct status
  codes and response shape (e.g. `GET /api/products` returns `{ count, products: [] }`).
- **Integration checks**: multi-step flows, such as registering a user, logging in
  with the returned credentials, and using the resulting JWT token to access
  protected cart/order routes.
- **Negative/edge-case testing**: deliberately sending invalid input (missing
  fields, wrong passwords, no auth token, invalid token, non-existent product IDs)
  to confirm the API fails safely with the correct status codes (400/401/404)
  instead of crashing or leaking data.

## Debugging Note
While writing `edge-cases.test.js`, an early version of the test assumed
`GET /api/products` returned a plain array. The real API returns an object
shaped like `{ count, products: [...] }`. Running the test surfaced this
mismatch immediately (`expected true, received false` on `Array.isArray`),
which was fixed by updating the test to check `res.body.products` instead.
This is a good example of how running tests early catches incorrect
assumptions before they cause bugs elsewhere.

## Optimization Notes
- Response times for all endpoints are fast locally (under a few hundred ms)
  since the data store is a JSON file rather than a networked database.
- On the live Render deployment (free tier), the **first** request after
  inactivity can take 30–50 seconds due to the instance spinning down —
  this is a hosting-tier limitation, not an application performance issue,
  and all requests after the first are fast again.
- Passwords are hashed with bcrypt only at register/login time (not on every
  request), keeping authenticated route response times low.