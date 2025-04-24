// components/StudentReports.js
import { useState, useEffect } from "react";
import { db, storage } from "@/firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

export default function StudentReports() {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const fetchStudents = async () => {
      const snapshot = await getDocs(collection(db, "students"));
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setStudents(data);
    };
    fetchStudents();
  }, []);

  const handleUpload = async (studentId, file) => {
    const storageRef = ref(storage, `reports/${studentId}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);

    await updateDoc(doc(db, "students", studentId), {
      reportUrl: url,
    });

    setStudents(prev =>
      prev.map(s =>
        s.id === studentId ? { ...s, reportUrl: url } : s
      )
    );
    alert("تم رفع كشف النقاط");
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">كشف النقاط</h2>
      <table className="min-w-full bg-white rounded shadow">
        <thead>
          <tr className="border-b">
            <th className="p-2">الاسم</th>
            <th className="p-2">الكشف</th>
            <th className="p-2">رفع جديد</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.id} className="border-b">
              <td className="p-2">{student.name}</td>
              <td className="p-2">
                {student.reportUrl ? (
                  <a
                    href={student.reportUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    عرض الكشف
                  </a>
                ) : (
                  "لا يوجد"
                )}
              </td>
              <td className="p-2">
                <input
                  type="file"
                  accept="application/pdf,image/*"
                  onChange={(e) =>
                    handleUpload(student.id, e.target.files[0])
                  }
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
