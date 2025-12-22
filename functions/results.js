const { onRequest } = require("firebase-functions/v2/https");
const { db, admin } = require("./db");

const resultsCollection = db.collection("results");

// -----------------------------------------------------
// CREATE RESULT
// -----------------------------------------------------
exports.createResult = onRequest(async (req, res) => {
  try {
    const {
      title,
      examName,
      department,
      category,
      resultDate,
      pdfUrl,
      cutoffDetails,
      scorecardLink,
      tags,
      summary,
      createdBy,
    } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    const resultData = {
      title,
      examName: examName || "",
      department: department || "",
      category: category || "",
      resultDate: resultDate
        ? admin.firestore.Timestamp.fromDate(new Date(resultDate))
        : null,
      pdfUrl: pdfUrl || "",
      cutoffDetails: cutoffDetails || "",
      scorecardLink: scorecardLink || "",
      tags: Array.isArray(tags) ? tags : [],
      summary: summary || "",
      status: "published",
      createdBy: createdBy || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const ref = await resultsCollection.add(resultData);
    res.json({ success: true, id: ref.id });
  } catch (err) {
    console.error("Error creating result:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// -----------------------------------------------------
// UPDATE RESULT
// -----------------------------------------------------
exports.updateResult = onRequest(async (req, res) => {
  try {
    const { id, ...updates } = req.body;
    if (!id) {
      return res.status(400).json({ error: "Result ID required" });
    }

    if (updates.resultDate) {
      updates.resultDate = admin.firestore.Timestamp.fromDate(
        new Date(updates.resultDate)
      );
    }

    updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();
    await resultsCollection.doc(id).update(updates);

    res.json({ success: true });
  } catch (err) {
    console.error("Error updating result:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// -----------------------------------------------------
// DELETE RESULT
// -----------------------------------------------------
exports.deleteResult = onRequest(async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ error: "Result ID required" });
    }

    await resultsCollection.doc(id).delete();
    res.json({ success: true, message: "Result deleted" });
  } catch (err) {
    console.error("Error deleting result:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// -----------------------------------------------------
// GET RESULTS LIST
// -----------------------------------------------------
exports.getResults = onRequest(async (req, res) => {
  try {
    const { category, department, examName, limit = 50 } = req.body || {};
    let query = resultsCollection.orderBy("resultDate", "desc");

    if (category) query = query.where("category", "==", category);
    if (department) query = query.where("department", "==", department);
    if (examName) query = query.where("examName", "==", examName);

    const snap = await query.limit(limit).get();
    const results = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({ success: true, results });
  } catch (err) {
    console.error("Error fetching results:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// -----------------------------------------------------
// GET RESULT DETAIL
// -----------------------------------------------------
exports.getResultDetail = onRequest(async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ error: "Result ID required" });
    }

    const doc = await resultsCollection.doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Result not found" });
    }

    res.json({
      success: true,
      result: { id: doc.id, ...doc.data() },
    });
  } catch (err) {
    console.error("Error fetching result detail:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
