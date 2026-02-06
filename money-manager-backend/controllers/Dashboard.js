const Transaction = require("../models/Transaction");

exports.getDashboard = async (req, res) => {
  const { type } = req.query;

  const start = new Date();
  if (type === "week") start.setDate(start.getDate() - 7);
  if (type === "month") start.setMonth(start.getMonth() - 1);
  if (type === "year") start.setFullYear(start.getFullYear() - 1);

  const transactions = await Transaction.find({ createdAt: { $gte: start } });

  const income = transactions
    .filter(t => t.type === "income")
    .reduce((a, b) => a + b.amount, 0);

  const expense = transactions
    .filter(t => t.type === "expense")
    .reduce((a, b) => a + b.amount, 0);

  res.json({ income, expense, history: transactions });
};
