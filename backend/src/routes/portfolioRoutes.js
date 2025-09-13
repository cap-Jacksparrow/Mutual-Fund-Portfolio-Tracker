const express = require("express");
const auth = require("../middlewares/auth");
const {
  addInvestment,
  getPortfolioValue,
  getPortfolioHistory,
  listPortfolio,
  removeInvestment,
} = require("../controllers/portfolioController");

const router = express.Router();

router.post("/add", auth, addInvestment);
router.get("/value", auth, getPortfolioValue);
router.get("/history", auth, getPortfolioHistory);
router.get("/list", auth, listPortfolio);
router.delete("/remove/:schemeCode", auth, removeInvestment);

module.exports = router;
