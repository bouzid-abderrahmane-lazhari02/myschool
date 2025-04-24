// eventService.js
import { db } from "../../firebase";
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";

export async function addEventToFirestore(event) {
  const { title, date, time, schoolId, target, targets, type } = event;

  if (!title || !date || !time || !type || !schoolId || !target) {
    alert("يرجى ملء جميع الحقول المطلوبة.");
    return;
  }

  // إنشاء مرجع للفعالية داخل مدرسة معينة
  const eventRef = doc(collection(db, "school", schoolId, "events"));

  await setDoc(eventRef, {
    id: eventRef.id,
    title,
    type,
    time,
    date: new Date(date),
    target,      // مثلا: "all" أو "years"
    targets: targets,  // مصفوفة بالأهداف المحددة مثل ["1", "2"]
    createdAt: serverTimestamp(),
  });

  alert("✅ تمت إضافة الفعالية بنجاح إلى Firestore");
}
