const Transaction = require("../models/Transaction");

// Add transaction
exports.addTransaction = async (req, res) => {
  try {
    const transaction = new Transaction(req.body);
    await transaction.save();
    res.status(201).json(transaction);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error adding transaction" });
  }
};

// Get all transactions with optional filters
exports.getTransactions = async (req, res) => {
  try {
    const { division, category, fromDate, toDate } = req.query;
    let filter = {};
    if (division) filter.division = division;
    if (category) filter.category = category;
    if (fromDate || toDate) filter.createdAt = {};
    if (fromDate) filter.createdAt.$gte = new Date(fromDate);
    if (toDate) filter.createdAt.$lte = new Date(toDate);

    const transactions = await Transaction.find(filter).sort({ createdAt: -1 });
    res.json(transactions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching transactions" });
  }
};

// Update transaction (only within 12 hours)
exports.updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await Transaction.findById(id);
    if (!transaction) return res.status(404).json({ message: "Transaction not found" });

    const diff = new Date() - transaction.createdAt;
    const hours = diff / 1000 / 60 / 60;
    if (hours > 12) return res.status(403).json({ message: "Edit window expired" });

    Object.assign(transaction, req.body);
    await transaction.save();
    res.json(transaction);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating transaction" });
  }
};
