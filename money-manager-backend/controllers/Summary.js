exports.summary = async (req, res) => {
    const data = await Transaction.aggregate([
      { $match: { type: "expense" } },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" }
        }
      }
    ]);
  
    res.json(data);
  };
  