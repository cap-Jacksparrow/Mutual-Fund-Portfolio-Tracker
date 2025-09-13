# Mutual Fund Portfolio Tracker

A Node.js + Express + MongoDB application to track mutual fund portfolios.  
It fetches schemes, latest NAVs, NAV history, and allows users to manage their investments.

---

## 🚀 Features
- User authentication (JWT)
- Mutual fund list with scheme details
- Latest NAV storage and history tracking
- Portfolio management (add, update, view)
- Portfolio valuation and history
- Rate limiting with express-rate-limit library
- Cron job for auto-updates

---

## 🛠️ Tech Stack
- Node.js / Express
- MongoDB / Mongoose
- Axios (API calls to [MFAPI.in](https://www.mfapi.in))
- Winston logger
- Node-cron (scheduling updates)

---

## ⚙️ Setup Instructions

### 1. Clone repo
```bash
git clone https://github.com/cap-Jacksparrow/Mutual-Fund-Portfolio-Tracker.git
