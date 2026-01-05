const { db, FieldValue } = require("./db");

// -----------------------------------------------------
// CREATE AD (EXPRESS VERSION)
// -----------------------------------------------------
exports.adsCreateAd = async (req, res) => {
  try {
    const { title } = req.body || {};

    if (!title) {
      return res.status(400).json({
        error: "title is required",
      });
    }

    await db.collection("ads").add({
      title,
      createdAt: FieldValue.serverTimestamp(),
    });

    res.status(201).json({ success: true });
  } catch (err) {
    console.error("adsCreateAd error:", err);
    res.status(500).json({ error: err.message });
  }
};
