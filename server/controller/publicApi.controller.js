// Thin public-API wrappers (/api/v1/*). They normalize the request shape and
// delegate to the existing dashboard controllers, which already read req.user
// (set by the verifyApiKey middleware) and req.query.subaccountId.
const a = require("./assistant.controller");

// GET /api/v1/assistants?subaccountId=
const listAssistants = (req, res) => a.getAssistants(req, res);

// GET /api/v1/assistants/:id?subaccountId=
const getAssistant = (req, res) => {
  req.query.assistantId = req.params.id;
  return a.getAssistant(req, res);
};

// POST /api/v1/calls  body: { assistantId, customerNumber, fromNumber, dynamicValues }
const createCall = (req, res) => {
  req.query.assistantId = req.body.assistantId;
  req.query.poutboundId = req.user; // makeOutboundCall reads the owner id from here
  return a.makeOutboundCall(req, res);
};

// GET /api/v1/calls?subaccountId=
const listCalls = (req, res) => a.getAssistantCallLogs(req, res);

// GET /api/v1/contacts?subaccountId=
const listContacts = (req, res) => a.getContacts(req, res);

// POST /api/v1/contacts  body: { subaccountId, firstName, lastName, email, phone, ... }
const createContact = (req, res) => a.createContact(req, res);

// GET /api/v1/analytics?subaccountId=
const analytics = (req, res) => a.getUserAnalytics(req, res);

module.exports = {
  listAssistants,
  getAssistant,
  createCall,
  listCalls,
  listContacts,
  createContact,
  analytics,
};
