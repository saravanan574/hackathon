const express = require("express");
const router = express.Router();
const {
  addTransaction,
  getTransactions,
  updateTransaction
} = require("../controllers/Transaction");

router.post("/", addTransaction);
router.get("/", getTransactions);
router.put("/:id", updateTransaction);

module.exports = router;
