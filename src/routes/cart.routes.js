const express = require("express");
const { getCart, addItem, updateItem, removeItem, clearCart } = require("../controllers/cartController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth); // every cart route requires a signed-in user

router.get("/", getCart);
router.post("/", addItem);
router.put("/:productId", updateItem);
router.delete("/:productId", removeItem);
router.delete("/", clearCart);

module.exports = router;
