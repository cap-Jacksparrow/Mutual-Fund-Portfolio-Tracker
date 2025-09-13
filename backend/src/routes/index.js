const express = require("express");
const authRoutes = require("./authRoutes");
const portfolioRouter = require("./portfolioRoutes");
const fundRoutes = require("./fundRoutes");
const { portfolioUpdateLimiter } = require("../middlewares/rateLimiter");
const router = express.Router();

router.use(authRoutes);
router.use(portfolioUpdateLimiter,portfolioRouter);
router.use(fundRoutes);

module.exports = router;