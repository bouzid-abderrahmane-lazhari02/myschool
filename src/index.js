// functions/index.js

// const functions = require("firebase-functions");
// const admin = require("firebase-admin");
// admin.initializeApp();

// exports.sendAbsenceNotification = functions.https.onCall(async (data, context) => {
//   const { token, subject, date } = data;

//   const message = {
//     token,
//     notification: {
//       title: "غياب مسجل",
//       body: `تم تسجيل غيابك في مادة ${subject} يوم ${date}`,
//     },
//   };

//   try {
//     const response = await admin.messaging().send(message);
//     return { success: true, response };
//   } catch (error) {
//     return { success: false, error: error.message };
//   }
// });
// src/index.js

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// ✅ تسجيل الـ Service Worker الخاص بـ FCM
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/firebase-messaging-sw.js")
    .then((registration) => {
      console.log("✅ Service Worker registered:", registration);
    })
    .catch((err) => {
      console.log("❌ Service Worker registration failed:", err);
    });
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
