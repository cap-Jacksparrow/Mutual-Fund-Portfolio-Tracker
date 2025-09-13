const mongoose = require("mongoose");

const fundLatestNavSchema = new mongoose.Schema(
  {
    schemeCode: { type: Number, required: true, index: true },
    nav: { type: Number, required: true },
    date: { type: String, required: true }, 
  },
  { timestamps: { createdAt: false, updatedAt: true } }
);

module.exports = mongoose.model("FundLatestNav", fundLatestNavSchema);
