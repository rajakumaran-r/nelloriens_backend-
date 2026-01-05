const { db, FieldValue } = require("./db");

const staysCollection = db.collection("famous_stays");

// -----------------------------------------------------
// CREATE STAY
// -----------------------------------------------------
exports.createFamousStay = async (req, res) => {
  try {
    const {
      name,
      category = "",
      location = "",
      priceRange = "",
      rating = 0,
      description = "",
      amenities = [],
      images = [],
      highlights = [],
      contactNumber = "",
      websiteUrl = "",
      mapUrl = "",
      createdBy = null,
    } = req.body || {};

    if (!name) {
      return res.status(400).json({ error: "Stay name is required" });
    }

    const ref = await staysCollection.add({
      name,
      category,
      location,
      priceRange,
      rating,
      description,
      amenities: Array.isArray(amenities) ? amenities : [],
      images: Array.isArray(images) ? images : [],
      highlights: Array.isArray(highlights) ? highlights : [],
      contactNumber,
      websiteUrl,
      mapUrl,
      createdBy,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    res.json({ success: true, id: ref.id });
  } catch (err) {
    console.error("createFamousStay error:", err);
    res.status(500).json({ error: err.message });
  }
};

// -----------------------------------------------------
// UPDATE STAY
// -----------------------------------------------------
exports.updateFamousStay = async (req, res) => {
  try {
    const { id, ...updates } = req.body || {};
    if (!id) {
      return res.status(400).json({ error: "Stay ID required" });
    }

    updates.updatedAt = FieldValue.serverTimestamp();
    await staysCollection.doc(id).update(updates);

    res.json({ success: true });
  } catch (err) {
    console.error("updateFamousStay error:", err);
    res.status(500).json({ error: err.message });
  }
};

// -----------------------------------------------------
// DELETE STAY
// -----------------------------------------------------
exports.deleteFamousStay = async (req, res) => {
  try {
    const { id } = req.body || {};
    if (!id) {
      return res.status(400).json({ error: "Stay ID required" });
    }

    await staysCollection.doc(id).delete();
    res.json({ success: true });
  } catch (err) {
    console.error("deleteFamousStay error:", err);
    res.status(500).json({ error: err.message });
  }
};

// -----------------------------------------------------
// GET STAYS LIST
// -----------------------------------------------------
exports.getFamousStays = async (req, res) => {
  try {
    const { category, limit = 100 } = req.query;

    let query = staysCollection.orderBy("createdAt", "desc");
    if (category) query = query.where("category", "==", category);

    const snap = await query.limit(Number(limit)).get();

    const stays = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({ success: true, stays });
  } catch (err) {
    console.error("getFamousStays error:", err);
    res.status(500).json({ error: err.message });
  }
};

// -----------------------------------------------------
// GET SINGLE STAY DETAIL
// -----------------------------------------------------
exports.getFamousStayDetail = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ error: "Stay ID required" });
    }

    const doc = await staysCollection.doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Stay not found" });
    }

    res.json({
      success: true,
      stay: { id: doc.id, ...doc.data() },
    });
  } catch (err) {
    console.error("getFamousStayDetail error:", err);
    res.status(500).json({ error: err.message });
  }
};
