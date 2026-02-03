const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const accountSchema = new Schema({
  name: { type: String, required: true },
  balance: { type: Number, required: true },
}, {
  timestamps: true,
});

const Account = mongoose.model('Account', accountSchema);

module.exports = Account;