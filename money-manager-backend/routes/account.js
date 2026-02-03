const router = require('express').Router();
let Account = require('../models/account.model');

router.route('/').get((req, res) => {
  Account.find()
    .then(account => res.json(account))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/add').post((req, res) => {
  const newAccount = new Account(req.body);

  newAccount.save()
    .then(() => res.json('Account added!'))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/:id').get((req, res) => {
  Account.findById(req.params.id)
    .then(account => res.json(account))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/:id').delete((req, res) => {
  Account.findByIdAndDelete(req.params.id)
    .then(() => res.json('Account deleted.'))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/update/:id').post((req, res) => {
  Account.findById(req.params.id)
    .then(account => {
      account.name = req.body.name;
      account.balance = req.body.balance;

      account.save()
        .then(() => res.json('Account updated!'))
        .catch(err => res.status(400).json('Error: ' + err));
    })
    .catch(err => res.status(400).json('Error: ' + err));
});

module.exports = router;