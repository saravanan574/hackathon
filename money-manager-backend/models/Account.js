const mongoose = require("mongoose");

const AccountSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    balance: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Avoid "Cannot overwrite model" errors
module.exports =
  mongoose.models.Account || mongoose.model("Account", AccountSchema);
