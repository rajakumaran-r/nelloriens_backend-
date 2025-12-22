const { onRequest } = require("firebase-functions/v2/https");
const { db, admin } = require("./db");

const updatesCollection = db.collection("updates");

// -----------------------------------------------------
// CREATE UPDATE
// -----------------------------------------------------
exports.createUpdate = onRequest(async (req, res) => {
  try {
    const {
      title,
      category,
      status,
      priority,
      startTime,
      endTime,
      visibility,
      link,
      summary,
      details,
      tags,
      pinToTop,
      showRightRailAd,
      createdBy,
    } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    const updateData = {
      title,
      category: category || "",
      status: status || "draft",
      priority: priority || "medium",
      startTime: startTime
        ? admin.firestore.Timestamp.fromDate(new Date(startTime))
        : null,
      endTime: endTime
        ? admin.firestore.Timestamp.fromDate(new Date(endTime))
        : null,
      visibility: visibility || "site-wide",
      link: link || null,
      summary: summary || "",
      details: details || "",
      tags: Array.isArray(tags) ? tags : [],
      pinToTop: !!pinToTop,
      showRightRailAd: !!showRightRailAd,
      createdBy: createdBy || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const ref = await updatesCollection.add(updateData);
    res.json({ success: true, id: ref.id });
  } catch (err) {
    console.error("Error creating update:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// -----------------------------------------------------
// UPDATE UPDATE
// -----------------------------------------------------
exports.updateUpdate = onRequest(async (req, res) => {
  try {
    const { id, ...updates } = req.body;
    if (!id) {
      return res.status(400).json({ error: "Update ID required" });
    }

    if (updates.startTime) {
      updates.startTime = admin.firestore.Timestamp.fromDate(
        new Date(updates.startTime)
      );
    }

    if (updates.endTime) {
      updates.endTime = admin.firestore.Timestamp.fromDate(
        new Date(updates.endTime)
      );
    }

    updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();
    await updatesCollection.doc(id).update(updates);

    res.json({ success: true });
  } catch (err) {
    console.error("Error updating update:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// -----------------------------------------------------
// DELETE UPDATE
// -----------------------------------------------------
exports.deleteUpdate = onRequest(async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ error: "Update ID required" });
    }

    await updatesCollection.doc(id).delete();
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting update:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// -----------------------------------------------------
// GET UPDATES LIST
// -----------------------------------------------------
exports.getUpdates = onRequest(async (req, res) => {
  try {
    const { category, status, limit = 100 } = req.body || {};
    let query = updatesCollection.orderBy("createdAt", "desc");

    if (category) query = query.where("category", "==", category);
    if (status) query = query.where("status", "==", status);

    const snap = await query.limit(limit).get();
    const updates = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({ success: true, updates });
  } catch (err) {
    console.error("Error fetching updates:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// -----------------------------------------------------
// GET SINGLE UPDATE DETAIL
// -----------------------------------------------------
exports.getUpdateDetail = onRequest(async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ error: "Update ID required" });
    }

    const doc = await updatesCollection.doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Update not found" });
    }

    res.json({
      success: true,
      update: { id: doc.id, ...doc.data() },
    });
  } catch (err) {
    console.error("Error fetching update detail:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
