const express = require("express");
const router = express.Router();
const { verifyApiKey } = require("../helpers/apiKeyAuth");
const pub = require("../controller/publicApi.controller");

// Every /api/v1 route is authenticated by a customer API key
router.use(verifyApiKey);

router.get("/assistants", pub.listAssistants);
router.get("/assistants/:id", pub.getAssistant);

router.post("/calls", pub.createCall);
router.get("/calls", pub.listCalls);

router.get("/contacts", pub.listContacts);
router.post("/contacts", pub.createContact);

router.get("/analytics", pub.analytics);

module.exports = router;
