const Account = require("../models/Account");

// Transfer amount between accounts
exports.transfer = async (req, res) => {
  try {
    const { from, to, amount } = req.body;
    if (!from || !to || !amount) return res.status(400).json({ message: "Invalid data" });

    const fromAcc = await Account.findOne({ name: from });
    const toAcc = await Account.findOne({ name: to });

    if (!fromAcc || !toAcc) return res.status(404).json({ message: "Account not found" });
    if (fromAcc.balance < amount) return res.status(400).json({ message: "Insufficient balance" });

    fromAcc.balance -= amount;
    toAcc.balance += amount;

    await fromAcc.save();
    await toAcc.save();

    res.json({ message: "Transfer successful", from: fromAcc, to: toAcc });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error during transfer" });
  }
};
