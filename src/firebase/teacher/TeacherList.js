import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";

function TeacherList() {
  const [teachers, setTeachers] = useState([]);

  useEffect(() => {
    const fetchTeachers = async () => {
      const querySnapshot = await getDocs(collection(db, "teachers"));
      const teacherData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTeachers(teacherData);
    };

    fetchTeachers();
  }, []);

  const handleEdit = (teacher) => {
    alert(`تعديل الأستاذ: ${teacher.name}`);
    // هنا سيتم فتح صفحة التعديل لاحقًا
  };

  const handleDelete = (teacherId) => {
    alert(`حذف الأستاذ ID: ${teacherId}`);
    // هنا سيتم تنفيذ الحذف من Firebase لاحقًا
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">قائمة الأساتذة</h2>
      <table className="w-full table-auto border-collapse border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-4 py-2">الاسم</th>
            <th className="border px-4 py-2">المادة</th>
            <th className="border px-4 py-2">القسم</th>
            <th className="border px-4 py-2">الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {teachers.map(teacher => (
            <tr key={teacher.id}>
              <td className="border px-4 py-2">{teacher.name}</td>
              <td className="border px-4 py-2">{teacher.subject}</td>
              <td className="border px-4 py-2">{teacher.class}</td>
              <td className="border px-4 py-2 space-x-2">
                <button
                  className="bg-blue-500 text-white px-3 py-1 rounded"
                  onClick={() => handleEdit(teacher)}
                >
                  تعديل
                </button>
                <button
                  className="bg-red-500 text-white px-3 py-1 rounded"
                  onClick={() => handleDelete(teacher.id)}
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

export default TeacherList;
