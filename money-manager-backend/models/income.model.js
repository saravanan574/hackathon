const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const incomeSchema = new Schema({
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: Date, required: true },
  category: { type: String, required: true },
  division: { type: String, required: true },
}, {
  timestamps: true,
});

const Income = mongoose.model('Income', incomeSchema);

module.exports = Income;