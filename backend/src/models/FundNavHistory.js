const mongoose = require("mongoose");

const fundNavHistorySchema = new mongoose.Schema(
  {
    schemeCode: { type: Number, required: true, index: true },
    nav: { type: Number, required: true },
    date: { type: String, required: true }, 
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

module.exports = mongoose.model("FundNavHistory", fundNavHistorySchema);
