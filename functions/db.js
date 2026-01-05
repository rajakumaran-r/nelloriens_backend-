require("dotenv").config(); // 👈 ADD THIS AT TOP

const admin = require("firebase-admin");

if (!admin.apps.length) {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    admin.initializeApp({
      credential: admin.credential.cert(
        JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
      ),
    });
  } else {
    throw new Error("FIREBASE_SERVICE_ACCOUNT not found");
  }
}

const db = admin.firestore();
const FieldValue = admin.firestore.FieldValue;

module.exports = { db, FieldValue };
