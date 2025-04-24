// studentService.js
import { db } from "../../firebase";
import { doc, setDoc, updateDoc, arrayUnion } from "firebase/firestore";

export async function addStudentToFirestore(student) {
  const { uid, fullName, schoolId, user, section, years, branches } = student;

  const sectionPath = `school/${schoolId}/years/${years}/branches/${branches}/sectoins/${section}`;

  await setDoc(doc(db, "students", uid), {
    uid,
    fullName,
    section,
    schoolId,
    user,
    years,
    branches,
    createdAt: new Date(),
  });

  await updateDoc(doc(db, sectionPath), {
    students: arrayUnion(uid),
  });

  alert("تمت إضافة التلميذ بنجاح");
}
