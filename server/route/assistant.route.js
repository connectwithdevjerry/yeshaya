const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
  createAssistantAndSave,
  deleteAssistant,
  getAssistant,
  getAssistants,
  updateAssistant,
  generatePrompt,
  deleteNumberFromAssistant,
  addATool,
  deleteAssistantTool,
  addCalendarId,
  getAssistantTools,
  addDynamicFMessageToDB,
  addKnowledgeBase,
  getAssistantCallLogs,
  getAssistantFullReport,
  makeOutboundCall,
  getConnectedCalendar,
  getAvailableCalendars,
  generateOutBoundCallUrl,
  getDynamicFMessage,
  getToolDetails,
  getFileDetails,
  linkKnowledgeBaseToAssistant,
  getAssistantKnowledgeBases,
  getAllKnowledgeBases,
  removeKnowledgeBaseFromAssistant,
  deleteKnowledgeBase,
  executeToolFromVapi,
} = require("../controller/assistant.controller");
const { verifyAccessToken } = require("../jwt_helpers");

const {
  CREATE_ASSISTANT,
  DELETE_ASSISTANT,
  GET_ASSISTANT,
  GET_ASSISTANTS,
  UPDATE_ASSISTANT,
  GENERATE_PROMPT,
  DELETE_NUM_FROM_VAPI,
  ADD_TOOL,
  DELETE_TOOL,
  ADD_CALENDAR,
  GET_TOOLS,
  ADD_DYNAMIC_MESSAGE,
  ADD_KNOWLEDGE_BASES,
  GET_ASSISTANT_KNOWLEDGE_BASES,
  GET_ASSISTANT_CALL_LOGS,
  GET_FULL_REPORT,
  MAKE_OUTBOUND_CALL,
  GET_CONNECTED_CALENDARS,
  GET_AVAILABLE_GHL_CALENDARS,
  GENERATE_OUTBOUND_CALL_URL,
  GET_DYNAMIC_MESSAGE,
  GET_TOOL_DETAILS,
  GET_FILE_DETAILS,
  GET_ALL_KNOWLEDGE_BASES,
  LINK_KNOWLEDGE_BASES_2_ASSISTANT,
  RMV_ASSISTANT_KNOWLEDGE,
  EXECUTE_TOOL,
  DELETE_KNOWLEDGE_BASE,
} = require("../constants");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

router.post(CREATE_ASSISTANT, verifyAccessToken, createAssistantAndSave);
router.delete(DELETE_ASSISTANT, verifyAccessToken, deleteAssistant);
router.get(GET_ASSISTANT, verifyAccessToken, getAssistant);
router.get(GET_ASSISTANTS, verifyAccessToken, getAssistants);
router.put(UPDATE_ASSISTANT, verifyAccessToken, updateAssistant);
router.post(GENERATE_PROMPT, verifyAccessToken, generatePrompt);
router.delete(
  DELETE_NUM_FROM_VAPI,
  verifyAccessToken,
  deleteNumberFromAssistant
);

// new routers
router.post(ADD_TOOL, verifyAccessToken, addATool);
router.post(EXECUTE_TOOL, verifyAccessToken, executeToolFromVapi);
router.delete(DELETE_TOOL, verifyAccessToken, deleteAssistantTool);
router.post(ADD_CALENDAR, verifyAccessToken, addCalendarId);
router.get(GET_TOOLS, verifyAccessToken, getAssistantTools);
router.post(ADD_DYNAMIC_MESSAGE, verifyAccessToken, addDynamicFMessageToDB);
router.get(GET_DYNAMIC_MESSAGE, verifyAccessToken, getDynamicFMessage);
router.get(GET_TOOL_DETAILS, verifyAccessToken, getToolDetails);
router.get(GET_FILE_DETAILS, verifyAccessToken, getFileDetails);
router.delete(DELETE_KNOWLEDGE_BASE, verifyAccessToken, deleteKnowledgeBase);
router.delete(
  RMV_ASSISTANT_KNOWLEDGE,
  verifyAccessToken,
  removeKnowledgeBaseFromAssistant
);
router.post(
  ADD_KNOWLEDGE_BASES,
  verifyAccessToken,
  upload.single("knowledgeBaseUrl"),
  addKnowledgeBase
);
router.get(
  GET_ASSISTANT_KNOWLEDGE_BASES,
  verifyAccessToken,
  getAssistantKnowledgeBases
);
router.get(GET_ALL_KNOWLEDGE_BASES, verifyAccessToken, getAllKnowledgeBases);
router.post(
  LINK_KNOWLEDGE_BASES_2_ASSISTANT,
  verifyAccessToken,
  linkKnowledgeBaseToAssistant
);
router.get(GET_ASSISTANT_CALL_LOGS, verifyAccessToken, getAssistantCallLogs);
router.get(GET_FULL_REPORT, verifyAccessToken, getAssistantFullReport);
router.post(MAKE_OUTBOUND_CALL, verifyAccessToken, makeOutboundCall);
router.get(
  GET_AVAILABLE_GHL_CALENDARS,
  verifyAccessToken,
  getAvailableCalendars
);
router.get(
  GENERATE_OUTBOUND_CALL_URL,
  verifyAccessToken,
  generateOutBoundCallUrl
);
router.get(GET_CONNECTED_CALENDARS, verifyAccessToken, getConnectedCalendar);

module.exports = router;
