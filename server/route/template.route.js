const express = require("express");
const router = express.Router();
const { verifyAccessToken } = require("../jwt_helpers");
const {
  getTemplates, getTemplate, createTemplate, updateTemplate,
  deleteTemplate, applyTemplate, restoreVersion, createFromPrompt,
} = require("../controller/template.controller");

router.get("/",                       verifyAccessToken, getTemplates);
router.post("/",                      verifyAccessToken, createTemplate);
router.post("/from-prompt",           verifyAccessToken, createFromPrompt);
router.get("/:id",                    verifyAccessToken, getTemplate);
router.put("/:id",                    verifyAccessToken, updateTemplate);
router.delete("/:id",                 verifyAccessToken, deleteTemplate);
router.post("/:id/apply",             verifyAccessToken, applyTemplate);
router.post("/:id/restore/:versionId", verifyAccessToken, restoreVersion);

module.exports = router;
