import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

export default function Teachers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [teachers, setTeachers] = useState([]);
  const navigate = useNavigate();
  
  // جلب بيانات المعلمين من قاعدة البيانات
  useEffect(() => {
    fetchTeachers();
  }, []);

  // دالة لجلب بيانات المعلمين
  const fetchTeachers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "teachers"));
      const teacherData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTeachers(teacherData);
    } catch (error) {
      console.error("خطأ في جلب بيانات المعلمين:", error);
    }
  };

  // دالة للانتقال إلى صفحة إضافة معلم
  const navigateToAddTeacher = () => {
    navigate('/add-teacher');
  };

  // دالة للانتقال إلى صفحة تعديل بيانات المعلم
  const handleEdit = (teacherId) => {
    navigate(`/edit-teacher/${teacherId}`);
  };

  // دالة لحذف المعلم
  const handleDelete = async (teacherId) => {
    if (window.confirm("هل أنت متأكد من رغبتك في حذف هذا المعلم؟")) {
      try {
        await deleteDoc(doc(db, "teachers", teacherId));
        // تحديث قائمة المعلمين بعد الحذف
        fetchTeachers();
        alert("تم حذف المعلم بنجاح");
      } catch (error) {
        console.error("خطأ في حذف المعلم:", error);
        alert("حدث خطأ أثناء محاولة حذف المعلم");
      }
    }
  };

  // تصفية المعلمين بناءً على البحث
  const filteredTeachers = teachers.filter(teacher => 
    teacher.name?.includes(searchTerm) || 
    teacher.subject?.includes(searchTerm)
  );

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">الأساتذة</h1>
          <button 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            onClick={navigateToAddTeacher}
          >
            إضافة أستاذ جديد
          </button>
        </div>

        {/* البحث */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="البحث عن أستاذ..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* جدول الأساتذة */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-3 px-4 text-right">الرقم</th>
                <th className="py-3 px-4 text-right">الاسم</th>
                <th className="py-3 px-4 text-right">المادة</th>
                <th className="py-3 px-4 text-right">الخبرة</th>
                <th className="py-3 px-4 text-right">عدد الفصول</th>
                <th className="py-3 px-4 text-right">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeachers.map((teacher, index) => (
                <tr key={teacher.id || index} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">{index + 1}</td>
                  <td className="py-3 px-4">{teacher.name}</td>
                  <td className="py-3 px-4">{teacher.subject}</td>
                  <td className="py-3 px-4">{teacher.experience || "-"}</td>
                  <td className="py-3 px-4">{teacher.assignedSections?.length || "-"}</td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2 space-x-reverse">
                      <button 
                        className="text-blue-600 hover:text-blue-800"
                        onClick={() => handleEdit(teacher.id)}
                      >
                        تعديل
                      </button>
                      <button 
                        className="text-red-600 hover:text-red-800 mr-3"
                        onClick={() => handleDelete(teacher.id)}
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