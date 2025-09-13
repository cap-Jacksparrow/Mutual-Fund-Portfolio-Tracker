const rateLimit = require("express-rate-limit");

// 1. Login attempts - per IP
 const loginLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // limit each IP to 5 requests per windowMs
  message: "Too many login attempts. Try again after a minute.",
keyGenerator: (req) => (req.ip ? req.ip.replace(/^::ffff:/, "") : "unknown-ip") // limit per IP
});

// 2. General API calls - per user
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100,
  message: "Too many requests. Please slow down.",
 keyGenerator: (req) => (req.ip ? req.ip.replace(/^::ffff:/, "") : "unknown-ip")// fallback to IP if no user
});

// 3. Portfolio update - per user
const portfolioUpdateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10,
  message: "Too many portfolio updates. Try again later.",
 keyGenerator: (req) => (req.ip ? req.ip.replace(/^::ffff:/, "") : "unknown-ip")
});

module.exports = {loginLimiter, apiLimiter, portfolioUpdateLimiter};
