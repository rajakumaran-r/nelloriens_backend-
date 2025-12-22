const { onRequest } = require("firebase-functions/v2/https");
const { db, admin } = require("./db");

const historyCollection = db.collection("history_sections");

// -----------------------------------------------------
// CREATE
// -----------------------------------------------------
exports.createHistorySection = onRequest(async (req, res) => {
  try {
    const {
      title,
      subtitle,
      description,
      imageUrl,
      year,
      order,
      tags,
      createdBy,
    } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    const sectionData = {
      title,
      subtitle: subtitle || "",
      description: description || "",
      imageUrl: imageUrl || "",
      year: year || "",
      order: order || 0,
      tags: Array.isArray(tags) ? tags : [],
      createdBy: createdBy || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const ref = await historyCollection.add(sectionData);
    res.json({ success: true, id: ref.id });
  } catch (err) {
    console.error("Create history error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// -----------------------------------------------------
// UPDATE
// -----------------------------------------------------
exports.updateHistorySection = onRequest(async (req, res) => {
  try {
    const { id, ...updates } = req.body;
    if (!id) {
      return res.status(400).json({ error: "Section ID required" });
    }

    updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();
    await historyCollection.doc(id).update(updates);

    res.json({ success: true });
  } catch (err) {
    console.error("Update history error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// -----------------------------------------------------
// DELETE
// -----------------------------------------------------
exports.deleteHistorySection = onRequest(async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ error: "Section ID required" });
    }

    await historyCollection.doc(id).delete();
    res.json({ success: true });
  } catch (err) {
    console.error("Delete history error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// -----------------------------------------------------
// GET ALL
// -----------------------------------------------------
exports.getHistory = onRequest(async (req, res) => {
  try {
    const snap = await historyCollection.orderBy("order", "asc").get();
    const sections = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({ success: true, history: sections });
  } catch (err) {
    console.error("Get history error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// -----------------------------------------------------
// GET ONE
// -----------------------------------------------------
exports.getHistorySection = onRequest(async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ error: "Section ID required" });
    }

    const doc = await historyCollection.doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: "History section not found" });
    }

    res.json({
      success: true,
      section: { id: doc.id, ...doc.data() },
    });
  } catch (err) {
    console.error("Get history section error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
