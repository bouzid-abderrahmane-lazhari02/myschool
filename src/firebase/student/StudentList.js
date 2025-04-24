import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";

function StudentList() {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const fetchStudents = async () => {
      const querySnapshot = await getDocs(collection(db, "students"));
      const studentData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStudents(studentData);
    };

    fetchStudents();
  }, []);

  const handleEdit = (student) => {
    alert(`تعديل الطالب: ${student.fullName}`);
    // هنا مستقبلاً نفتح مودال أو صفحة تعديل
  };

  const handleDelete = (studentId) => {
    alert(`حذف الطالب ID: ${studentId}`);
    // هنا مستقبلاً نحذف من فايربيز
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">قائمة التلاميذ</h2>
      <table className="w-full table-auto border-collapse border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-4 py-2">الاسم</th>
            {/* <th className="border px-4 py-2">البريد الإلكتروني</th> */}
            <th className="border px-4 py-2">السنة</th>
            <th className="border px-4 py-2">الشعبة</th>
            <th className="border px-4 py-2">القسم</th>
            <th className="border px-4 py-2">الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {students.map(student => (
            <tr key={student.id}>
              <td className="border px-4 py-2">{student.fullName}</td>
              {/* <td className="border px-4 py-2">{student.email}</td> */}
              <td className="border px-4 py-2">{student.years}</td>
              <td className="border px-4 py-2">{student.branches}</td>
              <td className="border px-4 py-2">{student.section}</td>
              <td className="border px-4 py-2 space-x-2">
                <button
                  className="bg-blue-500 text-white px-3 py-1 rounded"
                  onClick={() => handleEdit(student)}
                >
                  تعديل
                </button>
                <button
                  className="bg-red-500 text-white px-3 py-1 rounded"
                  onClick={() => handleDelete(student.id)}
                >
                  حذف
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default StudentList;
