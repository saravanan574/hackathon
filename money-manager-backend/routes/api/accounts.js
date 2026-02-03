const express = require('express');
const router = express.Router();
const Account = require('../../models/Account');

// @route   GET api/accounts
// @desc    Get all accounts
// @access  Public
router.get('/', async (req, res) => {
  try {
    const accounts = await Account.find();
    res.json(accounts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/accounts
// @desc    Add new account
// @access  Public
router.post('/', async (req, res) => {
  const { name, type, balance } = req.body;

  try {
    const newAccount = new Account({
      name,
      type,
      balance
    });

    const account = await newAccount.save();
    res.json(account);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;