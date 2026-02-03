const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost/money-manager', { useNewUrlParser: true, useUnifiedTopology: true });

const connection = mongoose.connection;
connection.once('open', () => {
  console.log('MongoDB database connection established successfully');
});

const incomeRouter = require('./routes/income');
const expenseRouter = require('./routes/expense');
const accountRouter = require('./routes/account');

app.use('/income', incomeRouter);
app.use('/expense', expenseRouter);
app.use('/account', accountRouter);

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});