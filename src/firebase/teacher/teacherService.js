// teacherService.js
import { db } from "../../firebase";
import { doc, setDoc, updateDoc, arrayUnion } from "firebase/firestore";

export async function addTeacherToFirestore(teacher) {
  const { uid, name, subject, schoolId, assignedSections, password } = teacher;

  // حفظ الأستاذ
  await setDoc(doc(db, "teachers", uid), {
    uid,
    name,
    subject,
    schoolId,
    password, // إضافة كلمة المرور
    assignedSections, // يمكن استخدامها لاحقًا للعرض
    createdAt: new Date(),
  });

  // إضافة الأستاذ للأقسام المحددة
  for (const assignment of assignedSections) {
    const { year, branch, section } = assignment;
    const path = `school/${schoolId}/years/${year}/branches/${branch}/sectoins/${section}`;
    await updateDoc(doc(db, path), {
      teachers: arrayUnion(uid),
    });
  }

  alert("تمت إضافة الأستاذ بنجاح ✅");
}
