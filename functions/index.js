const { onRequest } = require("firebase-functions/v2/https");

exports.testPing = onRequest((req, res) => {
  res.json({ success: true, message: "pong" });
});

/* =========================
   ADS APIs
========================= */
exports.adsCreateAd = require("./ads").createAd;
exports.adsUpdateAd = require("./ads").updateAd;
exports.adsDeleteAd = require("./ads").deleteAd;
exports.adsGetAds = require("./ads").getAds;
exports.adsGetAdPreview = require("./ads").getAdPreview;

/* =========================
   OTHER MODULES
========================= */
exports.jobs = require("./jobs");
exports.news = require("./news");
exports.updates = require("./updates");
exports.notifications = require("./notifications");
exports.results = require("./results");
exports.sports = require("./sports");
exports.famousFoods = require("./famousFoods");
exports.famousStay = require("./famousStay");
exports.history = require("./history");
// exports.media = require("./media"); // keep commented until bucket fixed
exports.commonAds = require("./commonAds");
