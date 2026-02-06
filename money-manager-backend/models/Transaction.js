const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["income", "expense"], required: true },
    amount: { type: Number, required: true },
    description: String,
    category: String,
    division: { type: String, enum: ["Personal", "Office"] },
    account: String
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", TransactionSchema);
