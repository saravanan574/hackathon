const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// Connect Database
connectDB();

app.use(cors());
app.use(express.json());

// Define Routes
app.use('/api/incomes', require('./routes/api/incomes'));
app.use('/api/expenses', require('./routes/api/expenses'));
app.use('/api/accounts', require('./routes/api/accounts'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));