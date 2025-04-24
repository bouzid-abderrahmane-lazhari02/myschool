// pages/Login.js
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { auth, db } from "./firebase";
import { messaging, getToken } from "./firebase";



export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate(); // ✅ هنا خارج الدوال

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const userId = userCred.user.uid;
  
      // جلب بيانات المدرسة
      const schoolDoc = await getDoc(doc(db, "schools", userId));
      if (schoolDoc.exists()) {
        localStorage.setItem("schoolId", userId);
  
        // ✅ طلب الإذن للحصول على التوكن
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          const token = await getToken(messaging, {
            vapidKey: "🔑 ضع هنا VAPID_KEY من Firebase Console"
          });
  
          if (token) {
            console.log("✅ FCM Token:", token);
            // يمكنك حفظ التوكن في Firestore إذا أردت
            // مثال:
            // await setDoc(doc(db, "schools", userId), { fcmToken: token }, { merge: true });
          } else {
            console.log("❌ لم يتم الحصول على التوكن");
          }
        }
  
        navigate("/dashboard");
      } else {
        setError("لم يتم العثور على بيانات المدرسة");
      }
    } catch (err) {
      setError("بيانات الدخول غير صحيحة");
    }
  };
  

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow w-96">
        <h2 className="text-2xl font-bold mb-4 text-center">
          تسجيل الدخول للمدرسة
        </h2>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <input
          type="email"
          placeholder="البريد الإلكتروني"
          className="w-full mb-4 p-2 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="كلمة المرور"
          className="w-full mb-4 p-2 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          دخول
        </button>
      </form>
    </div>
  );
}
