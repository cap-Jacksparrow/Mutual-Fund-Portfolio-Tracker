const cron = require("node-cron");
const { updateAllFundsAndNavs } = require("../helpers/fundAndNavFetch");

// Run daily at 12:00 AM IST
const updateNavJob = cron.schedule("0 0 * * *", async () => {
  await updateAllFundsAndNavs();
});

module.exports = { updateNavJob };
