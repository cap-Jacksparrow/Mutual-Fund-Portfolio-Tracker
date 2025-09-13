const Fund = require("../models/Fund");
const FundLatestNav = require("../models/FundLatestNav");
const FundNavHistory = require("../models/FundNavHistory");

/**
 * @desc Get list of funds with pagination & search
 * @route GET /api/funds?search=bluechip&page=1&limit=20
 */
const getFunds = async (req, res, next) => {
  try {
    const { search = "", page = 1, limit = 20 } = req.query;

    const query = search
      ? { schemeName: { $regex: search, $options: "i" } }
      : {};

    const totalFunds = await Fund.countDocuments(query);
    const totalPages = Math.ceil(totalFunds / limit);

    const funds = await Fund.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: {
        funds,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalFunds,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc Get NAV history for a specific fund
 * @route GET /api/funds/:schemeCode/nav
 */
const getFundNavHistory = async (req, res, next) => {
  try {
    const { schemeCode } = req.params;

    const fund = await Fund.findOne({ schemeCode });
    if (!fund) {
      return res.status(404).json({
        success: false,
        message: "Fund not found",
      });
    }

    const latestNav = await FundLatestNav.findOne({ schemeCode }).sort({ date: -1 });
    const history = await FundNavHistory.find({ schemeCode })
      .sort({ date: -1 })
      .limit(30);

    res.json({
      success: true,
      data: {
        schemeCode: fund.schemeCode,
        schemeName: fund.schemeName,
        currentNav: latestNav?.nav || null,
        asOn: latestNav?.date || null,
        history: history.map((h) => ({
          date: h.date,
          nav: h.nav,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getFunds, getFundNavHistory };
