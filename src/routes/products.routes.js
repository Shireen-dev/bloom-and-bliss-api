const express = require("express");
const { getAll, getOne, create, update, remove } = require("../controllers/productsController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/", getAll);
router.get("/:id", getOne);
router.post("/", requireAuth, create);
router.put("/:id", requireAuth, update);
router.delete("/:id", requireAuth, remove);

module.exports = router;
