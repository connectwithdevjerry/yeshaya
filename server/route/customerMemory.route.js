const express = require("express");
const router = express.Router();
const { verifyAccessToken, requireRole } = require("../jwt_helpers");
const {
  listMemories,
  getMemory,
  updateMemory,
  setOptOut,
  deleteMemory,
  getChatHistory,
  clearChatHistory,
} = require("../controller/customerMemory.controller");

// Reading what the assistants remember is open to any signed-in team member;
// changing or erasing it is an owner/admin action.
router.get("/list", verifyAccessToken, listMemories);
router.get("/detail", verifyAccessToken, getMemory);
router.put("/update", verifyAccessToken, requireRole("owner", "admin"), updateMemory);
router.put("/opt-out", verifyAccessToken, requireRole("owner", "admin"), setOptOut);
router.delete("/delete", verifyAccessToken, requireRole("owner", "admin"), deleteMemory);

// Chat Lab test thread — scoped to the acting team member, so anyone may manage
// their own.
router.get("/chat-history", verifyAccessToken, getChatHistory);
router.delete("/chat-history", verifyAccessToken, clearChatHistory);

module.exports = router;
