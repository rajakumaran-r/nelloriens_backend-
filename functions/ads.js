const { onRequest } = require("firebase-functions/v2/https");
const { db, admin } = require("./db");

const adsCollection = db.collection("ads");

exports.createAd = onRequest(async (req, res) => {
  try {
    const {
      name,
      advertiser,
      destinationUrl,
      adType,
      ctaLabel,
      shortDescription,
      createdBy,
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }

    const adData = {
      name,
      advertiser: advertiser || "",
      destinationUrl: destinationUrl || "",
      adType: adType || "image",
      ctaLabel: ctaLabel || "",
      shortDescription: shortDescription || "",
      status: "draft",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: createdBy || null,
    };

    const docRef = await adsCollection.add(adData);
    res.json({ success: true, id: docRef.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});
