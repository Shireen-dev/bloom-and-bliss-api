# Debugging Report — Bloom & Bliss API (Week 5)

## Process
As part of Week 5 testing, a new test file (`edge-cases.test.js`) was written
to cover negative/edge-case scenarios not previously tested: missing fields,
wrong passwords, missing/invalid auth tokens, and non-existent resource IDs.

## Issue Found
When first run, 29 of 30 tests passed, with one failure:

## Root Cause
The test assumed `GET /api/products` returned a plain JSON array directly.
In reality, the API wraps the product list inside an object:
`{ count: <number>, products: [...] }`. The test's assertion
(`Array.isArray(res.body)`) was checking the wrong part of the response,
so it correctly failed — this was a mistake in the test's assumption, not
a bug in the API itself.

## Fix
Cross-checked the actual response shape using the existing
`tests/products.test.js` file (which already correctly asserted
`Array.isArray(res.body.products)`), and updated the new edge-case test
to match:

```js
// Before (incorrect assumption)
expect(Array.isArray(res.body)).toBe(true);

// After (matches actual API response shape)
expect(Array.isArray(res.body.products)).toBe(true);