const express = require('express');
const connectDB = require('./config/db');

const app = express();

// Connect to database
connectDB();

// Init middleware
app.use(express.json({ extended: false }));

// Define routes
app.use('/api/accounts', require('./routes/api/accounts'));
app.use('/api/expenses', require('./routes/api/expenses'));
app.use('/api/incomes', require('./routes/api/incomes'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));