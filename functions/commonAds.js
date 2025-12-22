const { onRequest } = require("firebase-functions/v2/https");
const { db, admin } = require("./db");

const commonAdsCollection = db.collection("commonAds");

// -------------------------------
// Create Common Ad
// -------------------------------
exports.createCommonAd = onRequest(async (req, res) => {
  try {
    const {
      title,
      imageUrl,
      ctaText,
      destinationUrl,
      placement,
      status = "active",
    } = req.body;

    if (!title || !imageUrl || !destinationUrl) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newAd = {
      title,
      imageUrl,
      ctaText: ctaText || "",
      destinationUrl,
      placement: placement || "site-wide",
      status,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await commonAdsCollection.add(newAd);

    res.json({
      success: true,
      id: docRef.id,
      data: newAd,
    });
  } catch (err) {
    console.error("Error creating common ad:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// -------------------------------
// Get All Common Ads
// -------------------------------
exports.getCommonAds = onRequest(async (req, res) => {
  try {
    const { placement, status } = req.query;

    let query = commonAdsCollection.orderBy("createdAt", "desc");

    if (placement) query = query.where("placement", "==", placement);
    if (status) query = query.where("status", "==", status);

    const snapshot = await query.get();

    const ads = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({ success: true, ads });
  } catch (err) {
    console.error("Error fetching common ads:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// -------------------------------
// Get Single Common Ad Detail
// -------------------------------
exports.getCommonAdDetail = onRequest(async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ error: "Missing ad id" });
    }

    const doc = await commonAdsCollection.doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Common Ad not found" });
    }

    res.json({
      success: true,
      data: { id: doc.id, ...doc.data() },
    });
  } catch (err) {
    console.error("Error fetching common ad detail:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// -------------------------------
// Update Common Ad
// -------------------------------
exports.updateCommonAd = onRequest(async (req, res) => {
  try {
    const { id, ...updates } = req.body;
    if (!id) {
      return res.status(400).json({ error: "Missing ad id" });
    }

    updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();
    await commonAdsCollection.doc(id).update(updates);

    res.json({ success: true, message: "Common Ad updated" });
  } catch (err) {
    console.error("Error updating common ad:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// -------------------------------
// Delete Common Ad
// -------------------------------
exports.deleteCommonAd = onRequest(async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ error: "Missing ad id" });
    }

    await commonAdsCollection.doc(id).delete();
    res.json({ success: true, message: "Common Ad deleted" });
  } catch (err) {
    console.error("Error deleting common ad:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// -------------------------------
// Toggle Ad Status
// -------------------------------
exports.toggleCommonAdStatus = onRequest(async (req, res) => {
  try {
    const { id, status } = req.body;
    if (!id || !status) {
      return res.status(400).json({ error: "Missing fields" });
    }

    await commonAdsCollection.doc(id).update({
      status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({ success: true, message: "Status updated" });
  } catch (err) {
    console.error("Error toggling status:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
