const express = require("express");
const router = express.Router();
const { transfer } = require("../controllers/Account");

// Transfer between accounts
router.post("/accounts/transfer", transfer);

module.exports = router;
