const { db } = require("./db");
const { Timestamp } = require("firebase-admin/firestore");

// Collection
const notificationsCollection = db.collection("notifications");

// -----------------------------------------------------
// CREATE NOTIFICATION
// -----------------------------------------------------
exports.createNotification = async (req, res) => {
  try {
    const {
      title,
      message,
      type,
      priority,
      audience,
      actionUrl,
      expiresAt,
      createdBy,
    } = req.body || {};

    if (!title || !message) {
      return res.status(400).json({
        error: "Title and message are required",
      });
    }

    const data = {
      title,
      message,
      type: type || "info",          // info | warning | alert
      priority: priority || "normal", // low | normal | high
      audience: audience || "public", // public | users | admins
      actionUrl: actionUrl || null,
      expiresAt: expiresAt
        ? Timestamp.fromDate(new Date(expiresAt))
        : null,
      createdBy: createdBy || null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await notificationsCollection.add(data);

    res.json({ success: true, id: docRef.id });
  } catch (err) {
    console.error("createNotification error:", err);
    res.status(500).json({ error: err.message });
  }
};

// -----------------------------------------------------
// UPDATE NOTIFICATION
// -----------------------------------------------------
exports.updateNotification = async (req, res) => {
  try {
    const { id, ...updates } = req.body || {};

    if (!id) {
      return res.status(400).json({
        error: "Notification ID required",
      });
    }

    if (updates.expiresAt) {
      updates.expiresAt = Timestamp.fromDate(
        new Date(updates.expiresAt)
      );
    }

    updates.updatedAt = Timestamp.now();

    await notificationsCollection.doc(id).update(updates);

    res.json({ success: true });
  } catch (err) {
    console.error("updateNotification error:", err);
    res.status(500).json({ error: err.message });
  }
};

// -----------------------------------------------------
// DELETE NOTIFICATION
// -----------------------------------------------------
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.body || {};

    if (!id) {
      return res.status(400).json({
        error: "Notification ID required",
      });
    }

    await notificationsCollection.doc(id).delete();

    res.json({
      success: true,
      message: "Notification deleted",
    });
  } catch (err) {
    console.error("deleteNotification error:", err);
    res.status(500).json({ error: err.message });
  }
};

// -----------------------------------------------------
// GET NOTIFICATIONS LIST
// -----------------------------------------------------
exports.getNotifications = async (req, res) => {
  try {
    const { type, priority, audience, limit = 50 } = req.body || {};

    let query = notificationsCollection.orderBy(
      "createdAt",
      "desc"
    );

    if (type) query = query.where("type", "==", type);
    if (priority) query = query.where("priority", "==", priority);
    if (audience) query = query.where("audience", "==", audience);

    const snap = await query.limit(Number(limit)).get();

    const notifications = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({ success: true, notifications });
  } catch (err) {
    console.error("getNotifications error:", err);
    res.status(500).json({ error: err.message });
  }
};

// -----------------------------------------------------
// GET SINGLE NOTIFICATION
// -----------------------------------------------------
exports.getNotificationDetail = async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        error: "Notification ID required",
      });
    }

    const doc = await notificationsCollection.doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({
        error: "Notification not found",
      });
    }

    res.json({
      success: true,
      notification: { id: doc.id, ...doc.data() },
    });
  } catch (err) {
    console.error("getNotificationDetail error:", err);
    res.status(500).json({ error: err.message });
  }
};
