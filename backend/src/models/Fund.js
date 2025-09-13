const mongoose = require("mongoose");

const fundSchema = new mongoose.Schema(
  {
    schemeCode: { type: Number, unique: true, required: true },
    schemeName: { type: String, required: true },
    isinGrowth: { type: String },
    isinDivReinvestment: { type: String },
    fundHouse: { type: String },
    schemeType: { type: String },
    schemeCategory: { type: String },
  },
  { timestamps: false }
);

module.exports = mongoose.model("Fund", fundSchema);
