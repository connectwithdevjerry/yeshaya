const express = require("express");
const router = express.Router();
const {
  createAssistantAndSave,
  deleteAssistant,
  getAssistant,
  getAssistants,
  updateAssistant,
  generatePrompt,
} = require("../controller/assistant.controller");
const { verifyAccessToken } = require("../jwt_helpers");

const {
  CREATE_ASSISTANT,
  DELETE_ASSISTANT,
  GET_ASSISTANT,
  GET_ASSISTANTS,
  UPDATE_ASSISTANT,
  GENERATE_PROMPT,
} = require("../constants");

router.post(CREATE_ASSISTANT, verifyAccessToken, createAssistantAndSave);
router.delete(DELETE_ASSISTANT, verifyAccessToken, deleteAssistant);
router.get(GET_ASSISTANT, verifyAccessToken, getAssistant);
router.get(GET_ASSISTANTS, verifyAccessToken, getAssistants);
router.put(UPDATE_ASSISTANT, verifyAccessToken, updateAssistant);
router.put(GENERATE_PROMPT, verifyAccessToken, generatePrompt);

module.exports = router;
