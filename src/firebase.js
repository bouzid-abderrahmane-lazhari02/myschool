// import { initializeApp } from "firebase/app";
// import { getAuth } from "firebase/auth";
// import { getFirestore } from "firebase/firestore";
// import { getAnalytics } from "firebase/analytics";
// import { getMessaging } from "firebase/messaging";

// const firebaseConfig = {
//   apiKey: "AIzaSyAg6PJfnhoJlTcCiMofwPfLyhmBbk5Qbtk",
//   authDomain: "madrasati-22d43.firebaseapp.com",
//   projectId: "madrasati-22d43",
//   storageBucket: "madrasati-22d43.firebasestorage.app",
//   messagingSenderId: "668344708501",
//   appId: "1:668344708501:web:ffba26d95dc9c2ab4a9a9c",
//   measurementId: "G-6L761N7HYL"
// };

// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

// export const auth = getAuth(app);
// export const db = getFirestore(app);

// // ✅ إعداد FCM
// export const messaging = getMessaging(app);
// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging, getToken } from "firebase/messaging"; // ✅ أضف getMessaging و getToken
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAg6PJfnhoJlTcCiMofwPfLyhmBbk5Qbtk",
  authDomain: "madrasati-22d43.firebaseapp.com",
  projectId: "madrasati-22d43",
  storageBucket: "madrasati-22d43.appspot.com",
  messagingSenderId: "668344708501",
  appId: "1:668344708501:web:ffba26d95dc9c2ab4a9a9c",
  measurementId: "G-6L761N7HYL"
};

const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app);

// ✅ إعداد Firebase Messaging
export const messaging = getMessaging(app);
export { getToken }; // ✅ تصدير getToken لاستعماله خارجًا
