const { onRequest } = require("firebase-functions/v2/https");
const { db, admin } = require("./db");

const offersCollection = db.collection("offers");

// -----------------------------------------------------
// CREATE OFFER
// -----------------------------------------------------
exports.createOffer = onRequest(async (req, res) => {
  try {
    const data = req.body;

    const offer = {
      title: data.title || "",
      status: data.status || "draft",
      category: data.category || "",
      discountType: data.discountType || "",
      discountValue: data.discountValue || "",
      shortDescription: data.shortDescription || "",
      couponCode: data.couponCode || "",
      minCart: data.minCart || "",
      location: data.location || "",
      bookingUrl: data.bookingUrl || "",
      expiry: data.expiry
        ? admin.firestore.Timestamp.fromDate(new Date(data.expiry))
        : null,
      tags: Array.isArray(data.tags) ? data.tags : [],
      mediaUrl: data.mediaUrl || "",
      createdBy: data.createdBy || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const ref = await offersCollection.add(offer);
    res.json({ success: true, id: ref.id });
  } catch (err) {
    console.error("Error creating offer:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// -----------------------------------------------------
// UPDATE OFFER
// -----------------------------------------------------
exports.updateOffer = onRequest(async (req, res) => {
  try {
    const { id, ...updates } = req.body;
    if (!id) {
      return res.status(400).json({ error: "Offer ID required" });
    }

    updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();
    await offersCollection.doc(id).update(updates);

    res.json({ success: true });
  } catch (err) {
    console.error("Error updating offer:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// -----------------------------------------------------
// DELETE OFFER
// -----------------------------------------------------
exports.deleteOffer = onRequest(async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ error: "Offer ID required" });
    }

    await offersCollection.doc(id).delete();
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting offer:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// -----------------------------------------------------
// GET ALL OFFERS
// -----------------------------------------------------
exports.getOffers = onRequest(async (req, res) => {
  try {
    const snap = await offersCollection.orderBy("createdAt", "desc").get();
    const offers = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({ success: true, offers });
  } catch (err) {
    console.error("Error fetching offers:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// -----------------------------------------------------
// GET OFFER DETAIL
// -----------------------------------------------------
exports.getOfferDetail = onRequest(async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ error: "Offer ID required" });
    }

    const doc = await offersCollection.doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Offer not found" });
    }

    res.json({
      success: true,
      offer: { id: doc.id, ...doc.data() },
    });
  } catch (err) {
    console.error("Error fetching offer detail:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
