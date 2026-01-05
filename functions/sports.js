const { db } = require("./db");
const { Timestamp, FieldValue } = require("firebase-admin/firestore");

// Collection
const fixturesCollection = db.collection("sports_fixtures");

// -------------------------------------------------------------
// CREATE FIXTURE
// -------------------------------------------------------------
exports.createFixture = async (req, res) => {
  try {
    console.log("REQ BODY 👉", req.body);

    const {
      teamA,
      teamB,
      matchType,
      venue,
      matchDate,
      description,
    } = req.body || {};

    if (!teamA || !teamB) {
      return res.status(400).json({
        error: "Teams are required",
      });
    }

    let parsedDate = null;
    if (matchDate) {
      const d = new Date(matchDate);
      if (isNaN(d.getTime())) {
        return res.status(400).json({
          error: "Invalid matchDate",
        });
      }
      parsedDate = Timestamp.fromDate(d);
    }

    const fixtureData = {
      title: `${teamA} vs ${teamB}`,
      teamA,
      teamB,
      matchType: matchType || "",
      venue: venue || "",
      matchDate: parsedDate,
      description: description || "",
      status: "upcoming",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const ref = await fixturesCollection.add(fixtureData);

    res.json({ success: true, id: ref.id });
  } catch (err) {
    console.error("createFixture error:", err);
    res.status(500).json({
      error: err.message,
    });
  }
};

// -------------------------------------------------------------
// GET FIXTURES
// -------------------------------------------------------------
exports.getFixtures = async (req, res) => {
  try {
    const snap = await fixturesCollection
      .orderBy("createdAt", "desc")
      .get();

    const fixtures = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({ success: true, fixtures });
  } catch (err) {
    console.error("getFixtures error:", err);
    res.status(500).json({
      error: err.message,
    });
  }
};
