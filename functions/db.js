const admin = require("firebase-admin");

if (!admin.apps.length) {
  admin.initializeApp({
    storageBucket: "nellorieans.appspot.com",
  });
}

const db = admin.firestore();

module.exports = { admin, db };
