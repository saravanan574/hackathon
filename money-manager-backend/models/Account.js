const mongoose = require('mongoose');

const AccountSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  balance: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model('Account', AccountSchema);