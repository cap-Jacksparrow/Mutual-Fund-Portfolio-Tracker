const express = require("express");
const { getFunds, getFundNavHistory } = require("../controllers/fundController");

const router = express.Router();


router.get("/funds", getFunds);
router.get("/:schemeCode/nav", getFundNavHistory);

module.exports = router;
