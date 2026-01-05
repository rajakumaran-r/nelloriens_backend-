const { db, FieldValue } = require("./db");

const foodsCollection = db.collection("famous_foods");

// -----------------------------------------------------
// CREATE FOOD ITEM
// -----------------------------------------------------
exports.createFamousFood = async (req, res) => {
  try {
    const {
      name,
      category = "",
      priceRange = "",
      location = "",
      rating = 0,
      description = "",
      tags = [],
      imageUrl = "",
      mustTry = false,
      createdBy = null,
    } = req.body || {};

    if (!name) {
      return res.status(400).json({ error: "Food name is required" });
    }

    const ref = await foodsCollection.add({
      name,
      category,
      priceRange,
      location,
      rating,
      description,
      tags: Array.isArray(tags) ? tags : [],
      imageUrl,
      mustTry: !!mustTry,
      createdBy,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    res.json({ success: true, id: ref.id });
  } catch (err) {
    console.error("createFamousFood error:", err);
    res.status(500).json({ error: err.message });
  }
};

// -----------------------------------------------------
// UPDATE FOOD ITEM
// -----------------------------------------------------
exports.updateFamousFood = async (req, res) => {
  try {
    const { id, ...updates } = req.body || {};
    if (!id) {
      return res.status(400).json({ error: "Food ID required" });
    }

    updates.updatedAt = FieldValue.serverTimestamp();
    await foodsCollection.doc(id).update(updates);

    res.json({ success: true });
  } catch (err) {
    console.error("updateFamousFood error:", err);
    res.status(500).json({ error: err.message });
  }
};

// -----------------------------------------------------
// DELETE FOOD ITEM
// -----------------------------------------------------
exports.deleteFamousFood = async (req, res) => {
  try {
    const { id } = req.body || {};
    if (!id) {
      return res.status(400).json({ error: "Food ID required" });
    }

    await foodsCollection.doc(id).delete();
    res.json({ success: true });
  } catch (err) {
    console.error("deleteFamousFood error:", err);
    res.status(500).json({ error: err.message });
  }
};

// -----------------------------------------------------
// GET FOODS LIST
// -----------------------------------------------------
exports.getFamousFoods = async (req, res) => {
  try {
    const { category, tag, limit = 100 } = req.query;

    let query = foodsCollection.orderBy("createdAt", "desc");

    if (category) query = query.where("category", "==", category);
    if (tag) query = query.where("tags", "array-contains", tag);

    const snap = await query.limit(Number(limit)).get();

    const foods = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({ success: true, foods });
  } catch (err) {
    console.error("getFamousFoods error:", err);
    res.status(500).json({ error: err.message });
  }
};

// -----------------------------------------------------
// GET FOOD DETAIL
// -----------------------------------------------------
exports.getFamousFoodDetail = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ error: "Food ID required" });
    }

    const doc = await foodsCollection.doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Food not found" });
    }

    res.json({
      success: true,
      food: { id: doc.id, ...doc.data() },
    });
  } catch (err) {
    console.error("getFamousFoodDetail error:", err);
    res.status(500).json({ error: err.message });
  }
};
