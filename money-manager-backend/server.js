const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Schema
const TransactionSchema = new mongoose.Schema({
  type: { type: String, required: true },
  division: { type: String, required: true },
  category: { type: String, required: true },
  amount: { type: Number, required: true },
  description: String,
  date: { type: Date, default: Date.now },
  account: { type: String, default: 'Main' },
  editableUntil: { type: Date, required: true }
});

const Transaction = mongoose.model('Transaction', TransactionSchema);

// Connect to MongoDB Atlas (get free URL from mongodb.com/atlas)
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/money');

// Routes
app.post('/api/transactions', async (req, res) => {
  const editableUntil = new Date(Date.now() + 12 * 60 * 60 * 1000);
  const transaction = new Transaction({ ...req.body, editableUntil });
  await transaction.save();
  res.json(transaction);
});

app.get('/api/transactions', async (req, res) => {
  const { division, category, startDate, endDate } = req.query;
  let query = {};
  if (division) query.division = division;
  if (category) query.category = category;
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }
  const transactions = await Transaction.find(query).sort({ date: -1 });
  res.json(transactions);
});

app.get('/api/dashboard/:period', async (req, res) => {
  const { period } = req.params;
  const match = { date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } };
  const result = await Transaction.aggregate([
    { $match: match },
    { $group: { _id: '$type', total: { $sum: '$amount' } } }
  ]);
  res.json({
    income: result.find(r => r._id === 'income')?.total || 0,
    expense: result.find(r => r._id === 'expense')?.total || 0
  });
});

// Add after existing routes in server.js

// Category summary
app.get('/api/categories', async (req, res) => {
  const result = await Transaction.aggregate([
    { $match: { date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
    { $group: { _id: '$category', amount: { $sum: '$amount' }, count: { $sum: 1 } } },
    { $sort: { amount: -1 } },
    { $limit: 10 }
  ]);
  res.json(result.map(r => ({ category: r._id, amount: r.amount, count: r.count })));
});

// Update transaction
app.put('/api/transactions/:id', async (req, res) => {
  const transaction = await Transaction.findById(req.params.id);
  if (!transaction || new Date() > transaction.editableUntil) {
    return res.status(403).json({ error: 'Edit window expired or transaction not found' });
  }
  await Transaction.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true });
});

// Account transfers (basic)
app.post('/api/transfer', async (req, res) => {
  const { fromAccount, toAccount, amount } = req.body;
  // Logic for account transfer
  res.json({ success: true });
});


app.listen(5000, () => console.log('Backend running on http://localhost:5000'));
