const Portfolio = require("../models/Portfolio");
const Fund = require("../models/Fund");
const FundLatestNav = require("../models/FundLatestNav");
const FundNavHistory = require("../models/FundNavHistory");

exports.addInvestment = async (req, res) => {
  try {
    const { schemeCode, units } = req.body;
    const userId = req.user.id;

    const fund = await Fund.findOne({ schemeCode });
    if (!fund) return res.status(404).json({ success: false, message: "Fund not found" });
    
    const fundLatest = await FundLatestNav.findOne({schemeCode});
    if (!fundLatest) {
          return res.status(404).json({
             success: false,
             message: `No NAV found for schemeCode ${schemeCode}`,
             });
       }

    const purchaseNav = fundLatest.nav;

    const portfolio = await Portfolio.create({
      userId,
      schemeCode,
      units,
      purchaseDate: new Date(),
      purchaseNav
    });

    res.json({
      success: true,
      message: "Fund added to portfolio successfully",
      portfolio: {
        id: portfolio._id,
        schemeCode,
        schemeName: fund.schemeName,
        units,
        purchaseNav,
        addedAt: portfolio.createdAt,
      },
    });
  } catch (error) {
    res.status(422).json({ success: false, message: error });
  }
};

exports.getPortfolioValue = async (req, res) => {
  try {
    const userId = req.user.id;
    const portfolios = await Portfolio.find({ userId });
    if (!portfolios.length) return res.json({ success: true, data: { holdings: [] } });

    let totalInvestment = 0;
    let currentValue = 0;
    let asOn = "";

    const holdings = await Promise.all(
      portfolios.map(async (p) => {
        const fund = await Fund.findOne({ schemeCode: p.schemeCode });
        const latestNav = await FundLatestNav.findOne({ schemeCode: p.schemeCode }).sort({ updatedAt: -1 });

        if (!latestNav) return null;

        const investedValue = p.units * p.purchaseNav; 
        const holdingValue = p.units * latestNav.nav;

        totalInvestment += investedValue;
        currentValue += holdingValue;
        asOn = latestNav.date;

        return {
          schemeCode: p.schemeCode,
          schemeName: fund?.schemeName,
          units: p.units,
          currentNav: latestNav.nav,
          currentValue: holdingValue,
          investedValue,
          profitLoss: holdingValue - investedValue,
        };
      })
    );

    const profitLoss = currentValue - totalInvestment;

    res.json({
      success: true,
      data: {
        totalInvestment,
        currentValue,
        profitLoss,
        profitLossPercent: ((profitLoss / totalInvestment) * 100).toFixed(2),
        asOn,
        holdings: holdings.filter(Boolean),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getPortfolioHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const portfolios = await Portfolio.find({ userId });
    if (!portfolios.length) return res.json({ success: true, data: [] });

    // Get all scheme codes from user portfolio
    const schemeCodes = portfolios.map((p) => p.schemeCode);

    // Fetch NAV history for all user portfolio schemes
    const navHistory = await FundNavHistory.find({
      schemeCode: { $in: schemeCodes },
    }).sort({ date: 1 });

    if (!navHistory.length) {
      return res.json({ success: true, data: [] });
    }

    // Group NAV history by date
    const navByDate = {};
    navHistory.forEach((entry) => {
      if (!navByDate[entry.date]) navByDate[entry.date] = [];
      navByDate[entry.date].push(entry);
    });

    const history = [];

    // For each date, calculate portfolio total value
    for (const [date, navs] of Object.entries(navByDate)) {
      let totalValue = 0;
      let investedValue = 0;

      for (const p of portfolios) {
        const navEntry = navs.find((n) => n.schemeCode === p.schemeCode);
        if (navEntry) {
          const currentValue = p.units * navEntry.nav;
          totalValue += currentValue;

          // investedValue = units * purchase NAV (stored in portfolio when user bought)
          investedValue += p.units * p.purchaseNav;
        }
      }

      const profitLoss = totalValue - investedValue;

      history.push({
        date,
        totalValue: Number(totalValue.toFixed(2)),
        profitLoss: Number(profitLoss.toFixed(2)),
      });
    }

    res.json({ success: true, data: history });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


exports.listPortfolio = async (req, res) => {
  try {
    const userId = req.user.id;
    const portfolios = await Portfolio.find({ userId });

    const holdings = await Promise.all(
      portfolios.map(async (p) => {
        const fund = await Fund.findOne({ schemeCode: p.schemeCode });
        const latestNav = await FundLatestNav.findOne({ schemeCode: p.schemeCode });

        return {
          schemeCode: p.schemeCode,
          schemeName: fund?.schemeName,
          units: p.units,
          currentNav: latestNav?.nav,
          currentValue: latestNav ? p.units * latestNav.nav : 0,
        };
      })
    );

    res.json({
      success: true,
      data: { totalHoldings: holdings.length, holdings },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.removeInvestment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { schemeCode } = req.params;

    const deleted = await Portfolio.findOneAndDelete({ userId, schemeCode });
    if (!deleted) return res.status(404).json({ success: false, message: "Fund not found in portfolio" });

    res.json({ success: true, message: "Fund removed from portfolio successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
