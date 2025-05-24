// eventService.js
import { db } from "../../firebase";
import { collection, doc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";

export async function addEventToFirestore(event) {
  const { title, date, time, schoolId, target, targets, type, id } = event;

  if (!title || !date || !time || !type || !schoolId || !target) {
    throw new Error("يرجى ملء جميع الحقول المطلوبة.");
  }

  try {
    // تحويل التاريخ إلى كائن Date إذا كان نصًا
    const eventDate = typeof date === 'string' ? new Date(date) : date;
    
    // إنشاء كائن البيانات
    const eventData = {
      title,
      type,
      time,
      date: eventDate,
      target,
      targets: Array.isArray(targets) ? targets : [],
      updatedAt: serverTimestamp(),
      schoolId
    };

    // التحقق مما إذا كانت هذه عملية تعديل أو إضافة جديدة
    if (id) {
      // تعديل فعالية موجودة
      const eventRef = doc(db, "school", schoolId, "events", id);
      await updateDoc(eventRef, eventData);
      return { success: true, id, message: "تم تحديث الفعالية بنجاح" };
    } else {
      // إضافة فعالية جديدة
      const eventRef = doc(collection(db, "school", schoolId, "events"));
      eventData.id = eventRef.id;
      eventData.createdAt = serverTimestamp();
      await setDoc(eventRef, eventData);
      return { success: true, id: eventRef.id, message: "تمت إضافة الفعالية بنجاح" };
    }
  } catch (error) {
    console.error("خطأ في إضافة/تعديل الفعالية:", error);
    throw new Error(`فشل في إضافة/تعديل الفعالية: ${error.message}`);
  }
}

// دالة لتعديل فعالية موجودة
export async function updateEventInFirestore(event) {
  const { id, schoolId } = event;
  
  if (!id || !schoolId) {
    throw new Error("معرف الفعالية ومعرف المدرسة مطلوبان للتعديل");
  }
  
  return addEventToFirestore(event); // استخدام نفس الدالة مع معالجة مختلفة بناءً على وجود المعرف
}

// دالة لحذف فعالية
export async function deleteEventFromFirestore(schoolId, eventId) {
  if (!schoolId || !eventId) {
    throw new Error("معرف المدرسة ومعرف الفعالية مطلوبان للحذف");
  }
  
  try {
    const eventRef = doc(db, "school", schoolId, "events", eventId);
    await setDoc(eventRef, { deleted: true, deletedAt: serverTimestamp() }, { merge: true });
    return { success: true, message: "تم حذف الفعالية بنجاح" };
  } catch (error) {
    console.error("خطأ في حذف الفعالية:", error);
    throw new Error(`فشل في حذف الفعالية: ${error.message}`);
  }
}
