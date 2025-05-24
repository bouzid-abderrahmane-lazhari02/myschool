import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

export default function Students() {
  const [searchTerm, setSearchTerm] = useState("");
  const [students, setStudents] = useState([]);
  const navigate = useNavigate();
  
  // جلب بيانات التلاميذ من قاعدة البيانات
  useEffect(() => {
    fetchStudents();
  }, []);

  // دالة لجلب بيانات التلاميذ
  const fetchStudents = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "students"));
      const studentData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStudents(studentData);
    } catch (error) {
      console.error("خطأ في جلب بيانات التلاميذ:", error);
    }
  };

  // دالة للانتقال إلى صفحة إضافة تلميذ
  const navigateToAddStudent = () => {
    navigate('/students/add');
  };

  // دالة للانتقال إلى صفحة تعديل بيانات التلميذ
  const handleEdit = (studentId) => {
    navigate(`/edit-student/${studentId}`);
  };

  // دالة لحذف التلميذ
  const handleDelete = async (studentId) => {
    if (window.confirm("هل أنت متأكد من رغبتك في حذف هذا التلميذ؟")) {
      try {
        await deleteDoc(doc(db, "students", studentId));
        // تحديث قائمة التلاميذ بعد الحذف
        fetchStudents();
        alert("تم حذف التلميذ بنجاح");
      } catch (error) {
        console.error("خطأ في حذف التلميذ:", error);
        alert("حدث خطأ أثناء محاولة حذف التلميذ");
      }
    }
  };

  // تصفية التلاميذ بناءً على البحث
  const filteredStudents = students.filter(student => 
    student.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    student.uid?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-blue-800">التلاميذ</h1>
          <button 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            onClick={navigateToAddStudent}
          >
            إضافة تلميذ جديد
          </button>
        </div>

        {/* البحث */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="البحث عن تلميذ..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* جدول التلاميذ */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-3 px-4 text-right">الرقم</th>
                <th className="py-3 px-4 text-right">معرف التلميذ</th>
                <th className="py-3 px-4 text-right">الاسم الكامل</th>
                <th className="py-3 px-4 text-right">السنة</th>
                <th className="py-3 px-4 text-right">الشعبة</th>
                <th className="py-3 px-4 text-right">القسم</th>
                <th className="py-3 px-4 text-right">مكان الميلاد</th>
                <th className="py-3 px-4 text-right">تاريخ الميلاد</th>
                <th className="py-3 px-4 text-right">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student, index) => (
                <tr key={student.id || index} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">{index + 1}</td>
                  <td className="py-3 px-4">{student.uid}</td>
                  <td className="py-3 px-4">{student.fullName}</td>
                  <td className="py-3 px-4">{student.years}</td>
                  <td className="py-3 px-4">{student.branches}</td>
                  <td className="py-3 px-4">{student.section}</td>
                  <td className="py-3 px-4">{student.birthPlace}</td>
                  <td className="py-3 px-4">{student.birthDate}</td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2 space-x-reverse">
                      <button 
                        className="text-blue-600 hover:text-blue-800"
                        onClick={() => handleEdit(student.id)}
                      >
                        تعديل
                      </button>
                      <button 
                        className="text-red-600 hover:text-red-800 mr-3"
                        onClick={() => handleDelete(student.id)}
                      >
                        حذف
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}