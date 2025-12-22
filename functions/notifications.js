const { onRequest } = require("firebase-functions/v2/https");
const { db, admin } = require("./db");

const notificationsCollection = db.collection("notifications");

// -----------------------------------------------------
// CREATE NOTIFICATION
// -----------------------------------------------------
exports.createNotification = onRequest(async (req, res) => {
  try {
    const {
      title,
      category,
      department,
      level,
      date,
      summary,
      details,
      pdfUrl,
      externalLink,
      tags,
      createdBy,
    } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    const notificationData = {
      title,
      category: category || "",
      department: department || "",
      level: level || "",
      date: date
        ? admin.firestore.Timestamp.fromDate(new Date(date))
        : admin.firestore.FieldValue.serverTimestamp(),
      summary: summary || "",
      details: details || "",
      pdfUrl: pdfUrl || "",
      externalLink: externalLink || "",
      tags: Array.isArray(tags) ? tags : [],
      createdBy: createdBy || null,
      status: "published",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const ref = await notificationsCollection.add(notificationData);
    res.json({ success: true, id: ref.id });
  } catch (err) {
    console.error("Error creating notification:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// -----------------------------------------------------
// UPDATE NOTIFICATION
// -----------------------------------------------------
exports.updateNotification = onRequest(async (req, res) => {
  try {
    const { id, ...updates } = req.body;
    if (!id) {
      return res.status(400).json({ error: "Notification ID required" });
    }

    updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();
    await notificationsCollection.doc(id).update(updates);

    res.json({ success: true, message: "Notification updated" });
  } catch (err) {
    console.error("Error updating notification:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// -----------------------------------------------------
// DELETE NOTIFICATION
// -----------------------------------------------------
exports.deleteNotification = onRequest(async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ error: "Notification ID required" });
    }

    await notificationsCollection.doc(id).delete();
    res.json({ success: true, message: "Notification deleted" });
  } catch (err) {
    console.error("Error deleting notification:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// -----------------------------------------------------
// GET NOTIFICATIONS (LIST + FILTER)
// -----------------------------------------------------
exports.getNotifications = onRequest(async (req, res) => {
  try {
    const { category, department, level, limit = 100 } = req.body || {};
    let query = notificationsCollection.orderBy("date", "desc");

    if (category) query = query.where("category", "==", category);
    if (department) query = query.where("department", "==", department);
    if (level) query = query.where("level", "==", level);

    const snap = await query.limit(limit).get();
    const notifications = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({ success: true, notifications });
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// -----------------------------------------------------
// GET NOTIFICATION DETAIL
// -----------------------------------------------------
exports.getNotificationDetail = onRequest(async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ error: "Notification ID required" });
    }

    const doc = await notificationsCollection.doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.json({
      success: true,
      notification: { id: doc.id, ...doc.data() },
    });
  } catch (err) {
    console.error("Error fetching notification detail:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
