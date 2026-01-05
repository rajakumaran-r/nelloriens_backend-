const { db, FieldValue } = require("./db");

// -----------------------------------------------------
// CREATE
// -----------------------------------------------------
exports.createHistorySection = async (req, res) => {
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
    } = req.body || {};

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
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const ref = await db.collection("history_sections").add(sectionData);

    res.json({ success: true, id: ref.id });
  } catch (err) {
    console.error("createHistorySection error:", err);
    res.status(500).json({ error: err.message });
  }
};

// -----------------------------------------------------
// UPDATE
// -----------------------------------------------------
exports.updateHistorySection = async (req, res) => {
  try {
    const { id, ...updates } = req.body || {};
    if (!id) {
      return res.status(400).json({ error: "Section ID required" });
    }

    updates.updatedAt = FieldValue.serverTimestamp();
    await db.collection("history_sections").doc(id).update(updates);

    res.json({ success: true });
  } catch (err) {
    console.error("updateHistorySection error:", err);
    res.status(500).json({ error: err.message });
  }
};

// -----------------------------------------------------
// DELETE
// -----------------------------------------------------
exports.deleteHistorySection = async (req, res) => {
  try {
    const { id } = req.body || {};
    if (!id) {
      return res.status(400).json({ error: "Section ID required" });
    }

    await db.collection("history_sections").doc(id).delete();
    res.json({ success: true });
  } catch (err) {
    console.error("deleteHistorySection error:", err);
    res.status(500).json({ error: err.message });
  }
};

// -----------------------------------------------------
// GET ALL
// -----------------------------------------------------
exports.getHistory = async (req, res) => {
  try {
    const snap = await db
      .collection("history_sections")
      .orderBy("order", "asc")
      .get();

    const sections = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({ success: true, history: sections });
  } catch (err) {
    console.error("getHistory error:", err);
    res.status(500).json({ error: err.message });
  }
};

// -----------------------------------------------------
// GET ONE
// -----------------------------------------------------
exports.getHistorySection = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ error: "Section ID required" });
    }

    const doc = await db.collection("history_sections").doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: "History section not found" });
    }

    res.json({
      success: true,
      section: { id: doc.id, ...doc.data() },
    });
  } catch (err) {
    console.error("getHistorySection error:", err);
    res.status(500).json({ error: err.message });
  }
};
