const mongoose = require("mongoose");

const portfolioSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    schemeCode: { type: Number, required: true },
    units: { type: Number, required: true },
    purchaseDate: { type: Date, required: true },
    purchaseNav: { type: Number, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

module.exports = mongoose.model("Portfolio", portfolioSchema);
