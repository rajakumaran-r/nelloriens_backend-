const { db } = require("./db");
const { Timestamp } = require("firebase-admin/firestore");

// Firestore collection
const transportCollection = db.collection("transport");

// -----------------------------------------------------
// CREATE TRANSPORT
// -----------------------------------------------------
exports.createTransport = async (req, res) => {
  try {
    const {
      name,
      type,
      route,
      contactNumber,
      description,
      createdBy,
    } = req.body || {};

    if (!name) {
      return res.status(400).json({
        error: "Transport name is required",
      });
    }

    if (!type) {
      return res.status(400).json({
        error: "Transport type is required",
      });
    }

    const transportData = {
      name,
      type, // bus | auto | taxi | train
      route: route || "",
      contactNumber: contactNumber || "",
      description: description || "",
      status: "active",
      createdBy: createdBy || null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await transportCollection.add(transportData);

    res.json({ success: true, id: docRef.id });
  } catch (err) {
    console.error("createTransport error:", err);
    res.status(500).json({
      error: err.message,
    });
  }
};

// -----------------------------------------------------
// UPDATE TRANSPORT
// -----------------------------------------------------
exports.updateTransport = async (req, res) => {
  try {
    const { id, ...updates } = req.body || {};

    if (!id) {
      return res.status(400).json({
        error: "Transport ID required",
      });
    }

    updates.updatedAt = Timestamp.now();
    await transportCollection.doc(id).update(updates);

    res.json({ success: true });
  } catch (err) {
    console.error("updateTransport error:", err);
    res.status(500).json({
      error: err.message,
    });
  }
};

// -----------------------------------------------------
// DELETE TRANSPORT
// -----------------------------------------------------
exports.deleteTransport = async (req, res) => {
  try {
    const { id } = req.body || {};

    if (!id) {
      return res.status(400).json({
        error: "Transport ID required",
      });
    }

    await transportCollection.doc(id).delete();

    res.json({ success: true });
  } catch (err) {
    console.error("deleteTransport error:", err);
    res.status(500).json({
      error: err.message,
    });
  }
};

// -----------------------------------------------------
// GET TRANSPORT LIST
// -----------------------------------------------------
exports.getTransports = async (req, res) => {
  try {
    const { type, limit = 100 } = req.query || {};

    let query = transportCollection.orderBy("createdAt", "desc");
    if (type) query = query.where("type", "==", type);

    const snap = await query.limit(Number(limit)).get();
    const transports = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({ success: true, transports });
  } catch (err) {
    console.error("getTransports error:", err);
    res.status(500).json({
      error: err.message,
    });
  }
};

// -----------------------------------------------------
// GET SINGLE TRANSPORT
// -----------------------------------------------------
exports.getTransportDetail = async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        error: "Transport ID required",
      });
    }

    const doc = await transportCollection.doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({
        error: "Transport not found",
      });
    }

    res.json({
      success: true,
      transport: { id: doc.id, ...doc.data() },
    });
  } catch (err) {
    console.error("getTransportDetail error:", err);
    res.status(500).json({
      error: err.message,
    });
  }
};
