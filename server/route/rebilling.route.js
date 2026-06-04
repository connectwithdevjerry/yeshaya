const express = require("express");
const router = express.Router();
const { verifyAccessToken, requireRole } = require("../jwt_helpers");
const { getRebillingBreakdown, generateRebillingInvoice } = require("../controller/rebilling.controller");

router.get("/breakdown", verifyAccessToken, getRebillingBreakdown);
router.post("/invoice",  verifyAccessToken, requireRole("owner", "admin"), generateRebillingInvoice);

module.exports = router;
