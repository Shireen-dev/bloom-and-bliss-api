const express = require("express");
const { createOrder, getMyOrders, getOrder } = require("../controllers/ordersController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth); // every order route requires a signed-in user

router.post("/", createOrder);
router.get("/", getMyOrders);
router.get("/:id", getOrder);

module.exports = router;
