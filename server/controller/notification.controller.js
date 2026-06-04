const notificationModel = require("../model/notification.model");

// ─── Helper: create a notification (called internally from other controllers) ──
const createNotification = async ({ userId, type, title, message, metadata = {} }) => {
  try {
    await notificationModel.create({ userId, type, title, message, metadata });
  } catch (err) {
    console.error("Failed to create notification:", err.message);
  }
};

// ─── GET /notifications/all ───────────────────────────────────────────────────
const getNotifications = async (req, res) => {
  try {
    const userId = req.user;
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip  = (page - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
      notificationModel
        .find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      notificationModel.countDocuments({ userId }),
      notificationModel.countDocuments({ userId, read: false }),
    ]);

    res.status(200).json({
      status: true,
      notifications,
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("getNotifications error:", err);
    res.status(500).json({ status: false, message: "Failed to fetch notifications" });
  }
};

// ─── GET /notifications/unread-count ─────────────────────────────────────────
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user;
    const count  = await notificationModel.countDocuments({ userId, read: false });
    res.status(200).json({ status: true, count });
  } catch (err) {
    console.error("getUnreadCount error:", err);
    res.status(500).json({ status: false, message: "Failed to fetch unread count" });
  }
};

// ─── PUT /notifications/read/:id ──────────────────────────────────────────────
const markAsRead = async (req, res) => {
  try {
    const userId = req.user;
    const { id } = req.params;

    await notificationModel.findOneAndUpdate(
      { _id: id, userId },
      { read: true }
    );

    res.status(200).json({ status: true, message: "Marked as read" });
  } catch (err) {
    console.error("markAsRead error:", err);
    res.status(500).json({ status: false, message: "Failed to mark as read" });
  }
};

// ─── PUT /notifications/read-all ─────────────────────────────────────────────
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user;
    await notificationModel.updateMany({ userId, read: false }, { read: true });
    res.status(200).json({ status: true, message: "All notifications marked as read" });
  } catch (err) {
    console.error("markAllAsRead error:", err);
    res.status(500).json({ status: false, message: "Failed to mark all as read" });
  }
};

// ─── DELETE /notifications/:id ────────────────────────────────────────────────
const deleteNotification = async (req, res) => {
  try {
    const userId = req.user;
    const { id } = req.params;

    await notificationModel.findOneAndDelete({ _id: id, userId });
    res.status(200).json({ status: true, message: "Notification deleted" });
  } catch (err) {
    console.error("deleteNotification error:", err);
    res.status(500).json({ status: false, message: "Failed to delete notification" });
  }
};

// ─── DELETE /notifications/clear-all ─────────────────────────────────────────
const clearAllNotifications = async (req, res) => {
  try {
    const userId = req.user;
    await notificationModel.deleteMany({ userId });
    res.status(200).json({ status: true, message: "All notifications cleared" });
  } catch (err) {
    console.error("clearAllNotifications error:", err);
    res.status(500).json({ status: false, message: "Failed to clear notifications" });
  }
};

module.exports = {
  createNotification,
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
};
