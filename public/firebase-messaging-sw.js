/* eslint-disable no-undef */
// public/firebase-messaging-sw.js

importScripts("https://www.gstatic.com/firebasejs/10.8.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.8.1/firebase-messaging-compat.js");

// eslint-disable-next-line no-undef
firebase.initializeApp({
  apiKey: "AIzaSyAg6PJfnhoJlTcCiMofwPfLyhmBbk5Qbtk",
  authDomain: "madrasati-22d43.firebaseapp.com",
  projectId: "madrasati-22d43",
  storageBucket: "madrasati-22d43.firebasestorage.app",
  messagingSenderId: "668344708501",
  appId: "1:668344708501:web:ffba26d95dc9c2ab4a9a9c",
  measurementId: "G-6L761N7HYL"
});

// eslint-disable-next-line no-undef
const messaging = firebase.messaging();

// يمكنك تعديل شكل الإشعار هنا
messaging.onBackgroundMessage(function(payload) {
  console.log("[firebase-messaging-sw.js] Received background message ", payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/logo192.png"
  };

  // eslint-disable-next-line no-restricted-globals
  self.registration.showNotification(notificationTitle, notificationOptions);
});
