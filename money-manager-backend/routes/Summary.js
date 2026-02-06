const express = require("express");
const router = express.Router();
const { summary } = require("../controllers/Summary");

router.get("/", summary);

module.exports = router;
