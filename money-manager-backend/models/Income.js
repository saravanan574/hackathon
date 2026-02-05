const mongoose = require('mongoose');

const IncomeSchema = new mongoose.Schema({
  source: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('income', IncomeSchema);
