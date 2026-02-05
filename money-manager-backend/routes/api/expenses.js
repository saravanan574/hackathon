const express = require('express');
const router = express.Router();
const Expense = require('../../models/Expense');

// @route   GET api/expenses
// @desc    Get all expenses
// @access  Public
router.get('/', async (req, res) => {
  try {
    const expenses = await Expense.find();
    res.json(expenses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/expenses
// @desc    Add new expense
// @access  Public
router.post('/', async (req, res) => {
  const { description, amount, date } = req.body;

  try {
    const newExpense = new Expense({
      description,
      amount,
      date
    });

    const expense = await newExpense.save();
    res.json(expense);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;