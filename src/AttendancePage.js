import React, { useEffect, useState } from "react";
import { collection, getDocs, addDoc, Timestamp } from "firebase/firestore";
import { db } from "@/firebase";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/firebase"; // تأكد أنك قمت بتهيئة هذا الملف

export default function AttendancePage() {
  const [levels, setLevels] = useState([]);
  const [students, setStudents] = useState([]);
  const [filters, setFilters] = useState({
    level: "",
    stream: "",
    class: "",
    subject: "",
  });
  const [absentList, setAbsentList] = useState([]);

  useEffect(() => {
    fetchLevels();
  }, []);

  const fetchLevels = async () => {
    const snapshot = await getDocs(collection(db, "levels"));
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setLevels(data);
  };

  const fetchStudents = async () => {
    const snapshot = await getDocs(collection(db, "students"));
    const data = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(
        s =>
          s.level === filters.level &&
          s.stream === filters.stream &&
          s.class === filters.class
      );
    setStudents(data);
    setAbsentList([]);
  };

  const toggleAbsent = (studentId) => {
    if (absentList.includes(studentId)) {
      setAbsentList(absentList.filter(id => id !== studentId));
    } else {
      setAbsentList([...absentList, studentId]);
    }
  };

//   const submitAttendance = async () => {
//     const now = new Date();
//     for (const studentId of absentList) {
//       await addDoc(collection(db, "absences"), {
//         studentId,
//         subject: filters.subject,
//         date: Timestamp.fromDate(now),
//       });

//       // هنا يمكنك إرسال الإشعار إلى التلميذ إن كنت تستخدم Firebase Cloud Messaging
//     }
//     alert("تم تسجيل الغياب");
//   };

  const sendNotification = httpsCallable(functions, "sendAbsenceNotification");
  
  const submitAttendance = async () => {
    const now = new Date();
    for (const studentId of absentList) {
      const student = students.find(s => s.id === studentId);
  
      await addDoc(collection(db, "absences"), {
        studentId,
        subject: filters.subject,
        date: Timestamp.fromDate(now),
      });
  
      if (student.notificationToken) {
        await sendNotification({
          token: student.notificationToken,
          subject: filters.subject,
          date: now.toLocaleDateString(),
        });
      }
    }
    alert("تم تسجيل الغياب وإرسال الإشعارات");
  };
  
  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-semibold">تسجيل الحضور و الغياب</h2>
      <div className="grid grid-cols-4 gap-4">
        <input
          placeholder="السنة"
          value={filters.level}
          onChange={e => setFilters({ ...filters, level: e.target.value })}
          className="border p-2 rounded"
        />
        <input
          placeholder="الشعبة"
          value={filters.stream}
          onChange={e => setFilters({ ...filters, stream: e.target.value })}
          className="border p-2 rounded"
        />
        <input
          placeholder="القسم"
          value={filters.class}
          onChange={e => setFilters({ ...filters, class: e.target.value })}
          className="border p-2 rounded"
        />
        <input
          placeholder="المادة"
          value={filters.subject}
          onChange={e => setFilters({ ...filters, subject: e.target.value })}
          className="border p-2 rounded"
        />
        <button
          onClick={fetchStudents}
          className="col-span-4 bg-blue-600 text-white p-2 rounded"
        >
          عرض التلاميذ
        </button>
      </div>

      <table className="w-full border mt-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2">الاسم</th>
            <th className="border px-4 py-2">علامة الغياب</th>
          </tr>
        </thead>
        <tbody>
          {students.map(s => (
            <tr key={s.id}>
              <td className="border px-4 py-2">{s.name}</td>
              <td className="border px-4 py-2 text-center">
                <input
                  type="checkbox"
                  checked={absentList.includes(s.id)}
                  onChange={() => toggleAbsent(s.id)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {students.length > 0 && (
        <button
          onClick={submitAttendance}
          className="bg-green-600 text-white p-2 rounded mt-4"
        >
          حفظ الغياب
        </button>
      )}
    </div>
  );
}
