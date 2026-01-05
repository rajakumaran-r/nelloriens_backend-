const { db } = require("./db");
const { Timestamp } = require("firebase-admin/firestore");

// Collections
const newsCollection = db.collection("news");

// -----------------------------------------------------
// CREATE NEWS ARTICLE (EXPRESS VERSION)
// -----------------------------------------------------
exports.createNews = async (req, res) => {
  try {
    const {
      title,
      category,
      status,
      pinned,
      featured,
      author,
      publishDate,
      visibility,
      coverImageUrl,
      summary,
      body,
      tags,
      sourceUrl,
      seoTitle,
      seoDescription,
      showRightRailAd,
      createdBy,
    } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    const newsData = {
      title,
      category: category || "",
      status: status || "draft",
      pinned: !!pinned,
      featured: !!featured,
      author: author || "",
      publishDate: publishDate
        ? Timestamp.fromDate(new Date(publishDate))
        : null,
      visibility: visibility || "site-wide",
      coverImageUrl: coverImageUrl || null,
      summary: summary || "",
      body: body || "",
      tags: Array.isArray(tags) ? tags : [],
      sourceUrl: sourceUrl || null,
      seoTitle: seoTitle || null,
      seoDescription: seoDescription || null,
      showRightRailAd: !!showRightRailAd,
      createdBy: createdBy || null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await newsCollection.add(newsData);

    res.status(201).json({
      success: true,
      id: docRef.id,
    });
  } catch (err) {
    console.error("Error creating news:", err);
    res.status(500).json({
      error: err.message,
    });
  }
};
