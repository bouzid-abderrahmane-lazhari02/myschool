// studentService.js
import { db } from "../../firebase";
import { doc, setDoc, updateDoc, arrayUnion, getDoc } from "firebase/firestore";

export async function addStudentToFirestore(student) {
  const { uid, fullName, schoolId, user, section, years, branches, password,birthPlace,birthDate } = student;

  // تصحيح المسار ليكون عدد الأجزاء زوجياً
  const sectionPath = `school/${schoolId}/years/${years}/branches/${branches}/sectoins/${section}`;
  const sectionRef = doc(db, sectionPath);

  // إضافة الطالب إلى مجموعة الطلاب
  await setDoc(doc(db, "students", uid), {
    uid,
    fullName,
    section,
    schoolId,
    user,
    password,
    years,
    branches,
    birthPlace,
    birthDate,
    createdAt: new Date(),
  });

  try {
    // التحقق من وجود وثيقة القسم
    const sectionDoc = await getDoc(sectionRef);
    
    if (sectionDoc.exists()) {
      // إذا كانت الوثيقة موجودة، قم بتحديثها بإضافة معرف الطالب إلى مصفوفة الطلاب
      await updateDoc(sectionRef, {
        students: arrayUnion(uid),
      });
    } else {
      // إذا لم تكن الوثيقة موجودة، قم بإنشائها مع مصفوفة الطلاب
      await setDoc(sectionRef, {
        name: section,
        students: [uid],
        createdAt: new Date()
      });
    }
    
    alert("تمت إضافة التلميذ بنجاح");
  } catch (error) {
    console.error("خطأ في إضافة الطالب إلى القسم:", error);
    alert("تم إضافة الطالب ولكن حدث خطأ في إضافته إلى القسم: " + error.message);
  }
}
