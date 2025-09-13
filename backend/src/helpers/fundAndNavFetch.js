const axios = require("axios");
const Fund = require("../models/Fund");
const FundLatestNav = require("../models/FundLatestNav");
const FundNavHistory = require("../models/FundNavHistory");
const { logger } = require("../config/logger");

// Base URLs
const FUND_LIST_URL = "https://api.mfapi.in/mf";
const FUND_DETAIL_URL = (schemeCode) => `https://api.mfapi.in/mf/${schemeCode}`;
const FUND_LATEST_URL = (schemeCode) => `https://api.mfapi.in/mf/${schemeCode}/latest`;

/**
 * Fetch all funds list (only schemeCode & schemeName)
 */
async function fetchFundList() {
  const { data } = await axios.get(FUND_LIST_URL);
  return data; // Array of { schemeCode, schemeName }
}

/**
 * Fetch fund details 
 */
async function fetchFundDetails(schemeCode) {
  const { data } = await axios.get(FUND_DETAIL_URL(schemeCode));
  if (!data || !data.meta) return {};
  const meta = data.meta;
  return {
    fundHouse: meta.fund_house || null,
    schemeType: meta.scheme_type || null,
    schemeCategory: meta.scheme_category || null,
    isinGrowth: meta.isin?.growth || null,
    isinDivReinvestment: meta.isin?.dividend || null,
  };
}

/**
 * Fetch latest NAV
 */
async function fetchLatestNav(schemeCode) {
  const { data } = await axios.get(FUND_LATEST_URL(schemeCode));
  if (!data || !data.data || !data.data[0]) return null;
  return {
    nav: parseFloat(data.data[0].nav),
    date: data.data[0].date,
  };
}

/**
 * Fetch NAV history
 */
async function fetchNavHistory(schemeCode) {
  const { data } = await axios.get(FUND_DETAIL_URL(schemeCode));
  if (!data || !data.data) return [];
  return data.data.map((entry) => ({
    schemeCode,
    nav: parseFloat(entry.nav),
    date: entry.date,
    createdAt: new Date(),
  }));
}

/**
 * Upsert a single fund (details + latest NAV + history)
 */
async function upsertFundData(fund) {
  try {
    // 1. Fetch full fund details
    const details = await fetchFundDetails(fund.schemeCode);

    // 2. Save/Update Fund collection
    await Fund.findOneAndUpdate(
      { schemeCode: fund.schemeCode },
      {
        schemeCode: fund.schemeCode,
        schemeName: fund.schemeName,
        ...details,
      },
      { upsert: true, new: true }
    );

    // 3. Save Latest NAV
    const latestNav = await fetchLatestNav(fund.schemeCode);
    if (latestNav) {
      await FundLatestNav.findOneAndUpdate(
        { schemeCode: fund.schemeCode },
        { ...latestNav, schemeCode: fund.schemeCode, updatedAt: new Date() },
        { upsert: true, new: true }
      );
    }

    // 4. Save NAV History (skip duplicates)
    const navHistory = await fetchNavHistory(fund.schemeCode);
    if (navHistory.length) {
      await FundNavHistory.insertMany(navHistory, { ordered: false }).catch(() => {});
    }

    logger.info(`Updated: ${fund.schemeCode} - ${fund.schemeName}`);
  } catch (err) {
    logger.error(`Failed for schemeCode ${fund.schemeCode}: ${err.message}`);
  }
}

/**
 * Update ALL funds (fund details + NAVs + history)
 */
async function updateAllFundsAndNavs() {
  logger.info("Starting Fund + NAV update...");
  try {
    const fundList = await fetchFundList();
    for (const fund of fundList) {
      await upsertFundData(fund);
    }
    logger.info("Fund + NAV update completed.");
  } catch (error) {
    logger.error("Fund update job failed:", error);
  }
}

module.exports = {
  updateAllFundsAndNavs,
};
