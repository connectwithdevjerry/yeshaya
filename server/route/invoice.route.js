const express = require("express");
const router = express.Router();
const { verifyAccessToken, requireRole } = require("../jwt_helpers");
const {
  generateInvoice,
  getInvoices,
  getInvoice,
  downloadInvoice,
  sendInvoiceEmail,
} = require("../controller/invoice.controller");

router.post("/generate",      verifyAccessToken, requireRole("owner", "admin"), generateInvoice);
router.get("/all",            verifyAccessToken, getInvoices);
router.get("/:id/download",   verifyAccessToken, downloadInvoice);
router.post("/:id/send",      verifyAccessToken, sendInvoiceEmail);
router.get("/:id",            verifyAccessToken, getInvoice);

module.exports = router;
