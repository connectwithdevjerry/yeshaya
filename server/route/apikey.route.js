const express = require("express");
const router = express.Router();
const { verifyAccessToken } = require("../jwt_helpers");
const { createApiKey, listApiKeys, revokeApiKey } = require("../controller/apikey.controller");

// Dashboard-authenticated: customers manage their own keys
router.post("/", verifyAccessToken, createApiKey);
router.get("/", verifyAccessToken, listApiKeys);
router.delete("/:id", verifyAccessToken, revokeApiKey);

module.exports = router;
