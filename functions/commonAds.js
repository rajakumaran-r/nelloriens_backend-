const { db, FieldValue } = require("./db");

// -------------------------------
// Create Common Ad
// -------------------------------
exports.createCommonAd = async (req, res) => {
  try {
    const {
      title,
      imageUrl,
      ctaText,
      destinationUrl,
      placement = "site-wide",
      status = "active",
    } = req.body || {};

    if (!title || !imageUrl || !destinationUrl) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const docRef = await db.collection("commonAds").add({
      title,
      imageUrl,
      ctaText: ctaText || "",
      destinationUrl,
      placement,
      status,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    res.json({ success: true, id: docRef.id });
  } catch (err) {
    console.error("createCommonAd error:", err);
    res.status(500).json({ error: err.message });
  }
};

// -------------------------------
// Get All Common Ads
// -------------------------------
exports.getCommonAds = async (req, res) => {
  try {
    const { placement, status } = req.query;

    let query = db.collection("commonAds").orderBy("createdAt", "desc");
    if (placement) query = query.where("placement", "==", placement);
    if (status) query = query.where("status", "==", status);

    const snapshot = await query.get();
    const ads = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({ success: true, ads });
  } catch (err) {
    console.error("getCommonAds error:", err);
    res.status(500).json({ error: err.message });
  }
};

// -------------------------------
// Get Single Common Ad
// -------------------------------
exports.getCommonAdDetail = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ error: "Missing ad id" });
    }

    const doc = await db.collection("commonAds").doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Common Ad not found" });
    }

    res.json({ success: true, ad: { id: doc.id, ...doc.data() } });
  } catch (err) {
    console.error("getCommonAdDetail error:", err);
    res.status(500).json({ error: err.message });
  }
};

// -------------------------------
// Update Common Ad
// -------------------------------
exports.updateCommonAd = async (req, res) => {
  try {
    const { id, ...updates } = req.body || {};
    if (!id) {
      return res.status(400).json({ error: "Missing ad id" });
    }

    updates.updatedAt = FieldValue.serverTimestamp();
    await db.collection("commonAds").doc(id).update(updates);

    res.json({ success: true });
  } catch (err) {
    console.error("updateCommonAd error:", err);
    res.status(500).json({ error: err.message });
  }
};

// -------------------------------
// Delete Common Ad
// -------------------------------
exports.deleteCommonAd = async (req, res) => {
  try {
    const { id } = req.body || {};
    if (!id) {
      return res.status(400).json({ error: "Missing ad id" });
    }

    await db.collection("commonAds").doc(id).delete();
    res.json({ success: true });
  } catch (err) {
    console.error("deleteCommonAd error:", err);
    res.status(500).json({ error: err.message });
  }
};

// -------------------------------
// Toggle Ad Status
// -------------------------------
exports.toggleCommonAdStatus = async (req, res) => {
  try {
    const { id, status } = req.body || {};
    if (!id || !status) {
      return res.status(400).json({ error: "Missing fields" });
    }

    await db.collection("commonAds").doc(id).update({
      status,
      updatedAt: FieldValue.serverTimestamp(),
    });

    res.json({ success: true });
  } catch (err) {
    console.error("toggleCommonAdStatus error:", err);
    res.status(500).json({ error: err.message });
  }
};
