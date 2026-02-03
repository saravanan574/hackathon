const express = require('express');
const router = express.Router();
const Income = require('../../models/Income');

// @route   GET api/incomes
// @desc    Get all incomes
// @access  Public
router.get('/', async (req, res) => {
  try {
    const incomes = await Income.find();
    res.json(incomes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/incomes
// @desc    Add new income
// @access  Public
router.post('/', async (req, res) => {
  const { source, amount, date } = req.body;

  try {
    const newIncome = new Income({
      source,
      amount,
      date
    });

    const income = await newIncome.save();
    res.json(income);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;