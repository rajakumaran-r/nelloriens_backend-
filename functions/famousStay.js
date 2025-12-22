const { onRequest } = require("firebase-functions/v2/https");
const { db, admin } = require("./db");

const staysCollection = db.collection("famous_stays");

// -----------------------------------------------------
// CREATE STAY
// -----------------------------------------------------
exports.createFamousStay = onRequest(async (req, res) => {
  try {
    const {
      name,
      category,
      location,
      priceRange,
      rating,
      description,
      amenities,
      images,
      highlights,
      contactNumber,
      websiteUrl,
      mapUrl,
      createdBy,
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Stay name is required" });
    }

    const stayData = {
      name,
      category: category || "",
      location: location || "",
      priceRange: priceRange || "",
      rating: rating || 0,
      description: description || "",
      amenities: Array.isArray(amenities) ? amenities : [],
      images: Array.isArray(images) ? images : [],
      highlights: Array.isArray(highlights) ? highlights : [],
      contactNumber: contactNumber || "",
      websiteUrl: websiteUrl || "",
      mapUrl: mapUrl || "",
      createdBy: createdBy || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const ref = await staysCollection.add(stayData);
    res.json({ success: true, id: ref.id });
  } catch (err) {
    console.error("Error creating stay:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// -----------------------------------------------------
// UPDATE STAY
// -----------------------------------------------------
exports.updateFamousStay = onRequest(async (req, res) => {
  try {
    const { id, ...updates } = req.body;
    if (!id) {
      return res.status(400).json({ error: "Stay ID required" });
    }

    updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();
    await staysCollection.doc(id).update(updates);

    res.json({ success: true });
  } catch (err) {
    console.error("Error updating stay:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// -----------------------------------------------------
// DELETE STAY
// -----------------------------------------------------
exports.deleteFamousStay = onRequest(async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ error: "Stay ID required" });
    }

    await staysCollection.doc(id).delete();
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting stay:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// -----------------------------------------------------
// GET STAYS LIST
// -----------------------------------------------------
exports.getFamousStays = onRequest(async (req, res) => {
  try {
    const { category, limit = 100 } = req.body || {};

    let query = staysCollection.orderBy("createdAt", "desc");
    if (category) query = query.where("category", "==", category);

    const snap = await query.limit(limit).get();
    const stays = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({ success: true, stays });
  } catch (err) {
    console.error("Error fetching stays:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// -----------------------------------------------------
// GET SINGLE STAY DETAIL
// -----------------------------------------------------
exports.getFamousStayDetail = onRequest(async (req, res) => {
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
    console.error("Error fetching stay detail:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
