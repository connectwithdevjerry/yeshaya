const express = require("express");
const path = require("path");
const { verifyAccessToken } = require("../jwt_helpers");
const {
  listWidgets,
  createWidget,
  updateWidget,
  toggleWidgetMeta,
  deleteWidget,
  getWidgetConfig,
  widgetChat,
} = require("../controller/widget.controller");

// Authenticated dashboard CRUD — mounted at /widgets
const widgetRouter = express.Router();
widgetRouter.get("/", verifyAccessToken, listWidgets);
widgetRouter.post("/", verifyAccessToken, createWidget);
widgetRouter.put("/:id", verifyAccessToken, updateWidget);
widgetRouter.post("/:id/meta", verifyAccessToken, toggleWidgetMeta);
widgetRouter.delete("/:id", verifyAccessToken, deleteWidget);

// Public embed surface — mounted at /embed (no auth; called from external sites)
const embedRouter = express.Router();

// The copy-paste loader script
embedRouter.get("/widget.js", (req, res) => {
  res.type("application/javascript");
  res.set("Cache-Control", "public, max-age=300");
  res.sendFile(path.join(__dirname, "..", "public", "widget.js"));
});

embedRouter.get("/:publicId/config", getWidgetConfig);
embedRouter.post("/:publicId/chat", widgetChat);

module.exports = { widgetRouter, embedRouter };
