const express = require("express");
const router  = express.Router();
const { verifyAccessToken } = require("../jwt_helpers");
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
} = require("../controller/notification.controller");

router.get("/all",           verifyAccessToken, getNotifications);
router.get("/unread-count",  verifyAccessToken, getUnreadCount);
router.put("/read-all",      verifyAccessToken, markAllAsRead);
router.put("/read/:id",      verifyAccessToken, markAsRead);
router.delete("/clear-all",  verifyAccessToken, clearAllNotifications);
router.delete("/:id",        verifyAccessToken, deleteNotification);

module.exports = router;
