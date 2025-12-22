const { onRequest } = require("firebase-functions/v2/https");
const { db, admin } = require("./db");

// Collections
const fixturesCollection = db.collection("sports_fixtures");
const resultsCollection = db.collection("sports_results");
const highlightsCollection = db.collection("sports_highlights");

// -------------------------------------------------------------
// CREATE FIXTURE
// -------------------------------------------------------------
exports.createFixture = onRequest(async (req, res) => {
  try {
    const {
      title,
      teamA,
      teamB,
      matchType,
      venue,
      matchDate,
      startTime,
      description,
    } = req.body;

    if (!teamA || !teamB) {
      return res.status(400).json({ error: "Teams are required" });
    }

    const fixtureData = {
      title: title || `${teamA} vs ${teamB}`,
      teamA,
      teamB,
      matchType: matchType || "",
      venue: venue || "",
      matchDate: matchDate
        ? admin.firestore.Timestamp.fromDate(new Date(matchDate))
        : null,
      startTime: startTime || "",
      description: description || "",
      status: "upcoming",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const ref = await fixturesCollection.add(fixtureData);
    res.json({ success: true, id: ref.id });
  } catch (err) {
    console.error("Error creating fixture:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// -------------------------------------------------------------
// GET FIXTURES
// -------------------------------------------------------------
exports.getFixtures = onRequest(async (req, res) => {
  try {
    const snap = await fixturesCollection.orderBy("matchDate", "asc").get();
    const fixtures = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({ success: true, fixtures });
  } catch (err) {
    console.error("Error fetching fixtures:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// -------------------------------------------------------------
// UPDATE FIXTURE
// -------------------------------------------------------------
exports.updateFixture = onRequest(async (req, res) => {
  try {
    const { id, ...updates } = req.body;
    if (!id) {
      return res.status(400).json({ error: "Fixture ID required" });
    }

    if (updates.matchDate) {
      updates.matchDate = admin.firestore.Timestamp.fromDate(
        new Date(updates.matchDate)
      );
    }

    updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();
    await fixturesCollection.doc(id).update(updates);

    res.json({ success: true });
  } catch (err) {
    console.error("Error updating fixture:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// -------------------------------------------------------------
// DELETE FIXTURE
// -------------------------------------------------------------
exports.deleteFixture = onRequest(async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ error: "Fixture ID required" });
    }

    await fixturesCollection.doc(id).delete();
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting fixture:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// -------------------------------------------------------------
// CREATE MATCH RESULT
// -------------------------------------------------------------
exports.createMatchResult = onRequest(async (req, res) => {
  try {
    const {
      title,
      teamA,
      teamB,
      scoreA,
      scoreB,
      winner,
      matchType,
      venue,
      matchDate,
      summary,
      highlights,
    } = req.body;

    if (!teamA || !teamB) {
      return res.status(400).json({ error: "Teams are required" });
    }

    const resultData = {
      title: title || `${teamA} vs ${teamB}`,
      teamA,
      teamB,
      scoreA: scoreA || "",
      scoreB: scoreB || "",
      winner: winner || "",
      matchType: matchType || "",
      venue: venue || "",
      matchDate: matchDate
        ? admin.firestore.Timestamp.fromDate(new Date(matchDate))
        : null,
      summary: summary || "",
      highlights: highlights || "",
      status: "completed",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const ref = await resultsCollection.add(resultData);
    res.json({ success: true, id: ref.id });
  } catch (err) {
    console.error("Error creating match result:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// -------------------------------------------------------------
// GET MATCH RESULTS
// -------------------------------------------------------------
exports.getMatchResults = onRequest(async (req, res) => {
  try {
    const snap = await resultsCollection.orderBy("matchDate", "desc").get();
    const results = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({ success: true, results });
  } catch (err) {
    console.error("Error fetching match results:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// -------------------------------------------------------------
// GET MATCH DETAIL
// -------------------------------------------------------------
exports.getMatchDetail = onRequest(async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ error: "Match ID required" });
    }

    const doc = await resultsCollection.doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Match not found" });
    }

    res.json({
      success: true,
      match: { id: doc.id, ...doc.data() },
    });
  } catch (err) {
    console.error("Error fetching match detail:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// -------------------------------------------------------------
// UPDATE MATCH RESULT
// -------------------------------------------------------------
exports.updateMatchResult = onRequest(async (req, res) => {
  try {
    const { id, ...updates } = req.body;
    if (!id) {
      return res.status(400).json({ error: "Match ID required" });
    }

    if (updates.matchDate) {
      updates.matchDate = admin.firestore.Timestamp.fromDate(
        new Date(updates.matchDate)
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

// -------------------------------------------------------------
// DELETE MATCH RESULT
// -------------------------------------------------------------
exports.deleteMatchResult = onRequest(async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ error: "Match ID required" });
    }

    await resultsCollection.doc(id).delete();
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting result:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// -------------------------------------------------------------
// SPORTS HIGHLIGHTS
// -------------------------------------------------------------
exports.createSportsHighlight = onRequest(async (req, res) => {
  try {
    const ref = await highlightsCollection.add({
      ...req.body,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({ success: true, id: ref.id });
  } catch (err) {
    console.error("Error creating highlight:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

exports.getSportsHighlights = onRequest(async (req, res) => {
  try {
    const snap = await highlightsCollection.orderBy("createdAt", "desc").get();
    const highlights = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({ success: true, highlights });
  } catch (err) {
    console.error("Error fetching highlights:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

exports.deleteSportsHighlight = onRequest(async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ error: "Highlight ID required" });
    }

    await highlightsCollection.doc(id).delete();
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting highlight:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
