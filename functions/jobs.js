const { onRequest } = require("firebase-functions/v2/https");
const { db } = require("./db");
const { Timestamp } = require("firebase-admin/firestore");

// Firestore collection
const jobsCollection = db.collection("jobs");

// -----------------------------------------------------
// CREATE JOB
// -----------------------------------------------------
exports.createJob = onRequest(async (req, res) => {
  try {
    const {
      title,
      company,
      location,
      salary,
      type,
      description,
      applyUrl,
      tags,
      createdBy,
    } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Job title is required" });
    }

    const jobData = {
      title,
      company: company || "",
      location: location || "",
      salary: salary || "",
      type: type || "full-time",
      description: description || "",
      applyUrl: applyUrl || "",
      tags: Array.isArray(tags) ? tags : [],
      status: "open",
      createdBy: createdBy || null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await jobsCollection.add(jobData);
    return res.json({ success: true, id: docRef.id });
  } catch (err) {
    console.error("Error creating job:", err);
    return res.status(500).json({ error: err.message });
  }
});

// -----------------------------------------------------
// UPDATE JOB
// -----------------------------------------------------
exports.updateJob = onRequest(async (req, res) => {
  try {
    const { id, ...updates } = req.body;
    if (!id) {
      return res.status(400).json({ error: "Job ID required" });
    }

    updates.updatedAt = Timestamp.now();
    await jobsCollection.doc(id).update(updates);

    return res.json({ success: true, message: "Job updated" });
  } catch (err) {
    console.error("Error updating job:", err);
    return res.status(500).json({ error: err.message });
  }
});

// -----------------------------------------------------
// DELETE JOB
// -----------------------------------------------------
exports.deleteJob = onRequest(async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ error: "Job ID required" });
    }

    await jobsCollection.doc(id).delete();
    return res.json({ success: true, message: "Job deleted" });
  } catch (err) {
    console.error("Error deleting job:", err);
    return res.status(500).json({ error: err.message });
  }
});

// -----------------------------------------------------
// GET JOBS LIST
// -----------------------------------------------------
exports.getJobs = onRequest(async (req, res) => {
  try {
    const { type, location, limit = 100 } = req.body || {};
    let query = jobsCollection.orderBy("createdAt", "desc");

    if (type) query = query.where("type", "==", type);
    if (location) query = query.where("location", "==", location);

    const snap = await query.limit(limit).get();
    const jobs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    return res.json({ success: true, jobs });
  } catch (err) {
    console.error("Error fetching jobs:", err);
    return res.status(500).json({ error: err.message });
  }
});

// -----------------------------------------------------
// GET SINGLE JOB
// -----------------------------------------------------
exports.getJobDetail = onRequest(async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ error: "Job ID required" });
    }

    const doc = await jobsCollection.doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Job not found" });
    }

    return res.json({ success: true, job: { id: doc.id, ...doc.data() } });
  } catch (err) {
    console.error("Error fetching job detail:", err);
    return res.status(500).json({ error: err.message });
  }
});
