const express = require("express");
const router = express.Router();
const { verifyAccessToken } = require("../jwt_helpers");
const {
  listActiveTags,
  createActiveTag,
  updateActiveTag,
  deleteActiveTag,
} = require("../controller/activeTag.controller");

router.get("/", verifyAccessToken, listActiveTags);
router.post("/", verifyAccessToken, createActiveTag);
router.put("/:id", verifyAccessToken, updateActiveTag);
router.delete("/:id", verifyAccessToken, deleteActiveTag);

module.exports = router;
