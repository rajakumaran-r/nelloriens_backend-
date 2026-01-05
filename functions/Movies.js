const { db } = require("./db");
const { Timestamp } = require("firebase-admin/firestore");

// Firestore collection
const moviesCollection = db.collection("movies");

// -----------------------------------------------------
// CREATE MOVIE
// -----------------------------------------------------
exports.createMovie = async (req, res) => {
  try {
    const {
      title,
      language,
      genre,
      duration,
      rating,
      releaseDate,
      description,
      posterUrl,
      trailerUrl,
      createdBy,
    } = req.body || {};

    if (!title) {
      return res.status(400).json({ error: "Movie title is required" });
    }

    const movieData = {
      title,
      language: language || "",
      genre: Array.isArray(genre) ? genre : [],
      duration: duration || "",
      rating: rating || "",
      releaseDate: releaseDate || "",
      description: description || "",
      posterUrl: posterUrl || "",
      trailerUrl: trailerUrl || "",
      status: "active",
      createdBy: createdBy || null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await moviesCollection.add(movieData);

    res.json({ success: true, id: docRef.id });
  } catch (err) {
    console.error("createMovie error:", err);
    res.status(500).json({ error: err.message });
  }
};

// -----------------------------------------------------
// UPDATE MOVIE
// -----------------------------------------------------
exports.updateMovie = async (req, res) => {
  try {
    const { id, ...updates } = req.body || {};

    if (!id) {
      return res.status(400).json({ error: "Movie ID required" });
    }

    updates.updatedAt = Timestamp.now();
    await moviesCollection.doc(id).update(updates);

    res.json({ success: true, message: "Movie updated" });
  } catch (err) {
    console.error("updateMovie error:", err);
    res.status(500).json({ error: err.message });
  }
};

// -----------------------------------------------------
// DELETE MOVIE
// -----------------------------------------------------
exports.deleteMovie = async (req, res) => {
  try {
    const { id } = req.body || {};

    if (!id) {
      return res.status(400).json({ error: "Movie ID required" });
    }

    await moviesCollection.doc(id).delete();

    res.json({ success: true, message: "Movie deleted" });
  } catch (err) {
    console.error("deleteMovie error:", err);
    res.status(500).json({ error: err.message });
  }
};

// -----------------------------------------------------
// GET MOVIES LIST
// -----------------------------------------------------
exports.getMovies = async (req, res) => {
  try {
    const { language, status = "active", limit = 100 } = req.body || {};

    let query = moviesCollection
      .where("status", "==", status)
      .orderBy("createdAt", "desc");

    if (language) {
      query = query.where("language", "==", language);
    }

    const snap = await query.limit(Number(limit)).get();

    const movies = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({ success: true, movies });
  } catch (err) {
    console.error("getMovies error:", err);
    res.status(500).json({ error: err.message });
  }
};

// -----------------------------------------------------
// GET SINGLE MOVIE
// -----------------------------------------------------
exports.getMovieDetail = async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: "Movie ID required" });
    }

    const doc = await moviesCollection.doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Movie not found" });
    }

    res.json({
      success: true,
      movie: { id: doc.id, ...doc.data() },
    });
  } catch (err) {
    console.error("getMovieDetail error:", err);
    res.status(500).json({ error: err.message });
  }
};
