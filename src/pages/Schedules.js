import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, deleteDoc, doc, query, orderBy, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function Schedules() {
  const [schedules, setSchedules] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState("day");
  const [sortDirection, setSortDirection] = useState("asc");
  const navigate = useNavigate();
  
  // جلب بيانات الجداول من قاعدة البيانات
  useEffect(() => {
    fetchSchedules();
  }, []);

  // دالة لجلب بيانات الجداول
  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const schedulesQuery = query(collection(db, "schedules"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(schedulesQuery);
      const scheduleData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSchedules(scheduleData);
    } catch (error) {
      console.error("خطأ في جلب بيانات الجداول:", error);
    } finally {
      setLoading(false);
    }
  };

  // دالة للانتقال إلى صفحة إضافة جدول
  const navigateToAddSchedule = () => {
    navigate('/schedule');
  };

  // دالة للانتقال إلى صفحة تعديل الجدول
  const handleEdit = async (schedule) => {
    try {
      // محاولة جلب بيانات الجدول الكاملة من قاعدة البيانات
      const scheduleDocRef = doc(db, "schedules", schedule.id);
      const scheduleDoc = await getDoc(scheduleDocRef);
      
      if (scheduleDoc.exists()) {
        const scheduleData = scheduleDoc.data();
        
        // تخزين بيانات الجدول في التخزين المحلي لاستخدامها في صفحة الإضافة
        localStorage.setItem('editSchedule', JSON.stringify({
          ...schedule,
          scheduleData: scheduleData.scheduleData || null
        }));
      } else {
        // إذا لم نجد بيانات إضافية، نخزن البيانات الأساسية فقط
        localStorage.setItem('editSchedule', JSON.stringify(schedule));
      }
      
      // الانتقال إلى صفحة إضافة جدول
      navigate('/schedule');
    } catch (error) {
      console.error("خطأ في جلب بيانات الجدول للتعديل:", error);
      // في حالة حدوث خطأ، نخزن البيانات الأساسية فقط
      localStorage.setItem('editSchedule', JSON.stringify(schedule));
      navigate('/schedule');
    }
  };

  // دالة لحذف الجدول
  const handleDelete = async (scheduleId) => {
    if (window.confirm("هل أنت متأكد من رغبتك في حذف هذا الجدول؟")) {
      try {
        await deleteDoc(doc(db, "schedules", scheduleId));
        // تحديث قائمة الجداول بعد الحذف
        fetchSchedules();
        alert("تم حذف الجدول بنجاح");
      } catch (error) {
        console.error("خطأ في حذف الجدول:", error);
        alert("حدث خطأ أثناء محاولة حذف الجدول");
      }
    }
  };

  // دالة للترتيب
  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // تصفية وترتيب الجداول
  const filteredAndSortedSchedules = schedules
    .filter(schedule => 
      (schedule.subject?.toLowerCase() || "").includes(searchTerm.toLowerCase()) || 
      (schedule.teacher?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (schedule.day?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (schedule.class?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const fieldA = (a[sortField] || "").toLowerCase();
      const fieldB = (b[sortField] || "").toLowerCase();
      
      if (sortDirection === "asc") {
        return fieldA.localeCompare(fieldB);
      } else {
        return fieldB.localeCompare(fieldA);
      }
    });

  // دالة لعرض أيقونة الترتيب
  const renderSortIcon = (field) => {
    if (field !== sortField) return null;
    return sortDirection === "asc" ? "↑" : "↓";
  };

  if (loading) {
    return (
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="bg-white rounded-lg shadow-md p-8 flex justify-center items-center min-h-[300px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto mb-4"></div>
            <p className="text-gray-600">جاري تحميل البيانات...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-blue-800">الجداول الدراسية</h1>
          <button 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            onClick={navigateToAddSchedule}
          >
            <span className="mr-2">+</span>
            إضافة جدول جديد
          </button>
        </div>

        {/* البحث */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="البحث في الجداول..."
              className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
              width="20" 
              height="20" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {schedules.length === 0 ? (
          <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200 text-center">
            <svg className="w-12 h-12 text-yellow-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-lg font-medium text-yellow-800">لا توجد جداول دراسية متاحة حالياً</p>
            <p className="text-gray-600 mt-2">قم بإضافة جدول جديد باستخدام الزر أعلاه</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full table-auto border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border-b px-4 py-3 text-right text-sm font-medium text-gray-500">الرقم</th>
                  <th 
                    className="border-b px-4 py-3 text-right text-sm font-medium text-gray-500 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("day")}
                  >
                    اليوم {renderSortIcon("day")}
                  </th>
                  <th 
                    className="border-b px-4 py-3 text-right text-sm font-medium text-gray-500 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("class")}
                  >
                    الفصل {renderSortIcon("class")}
                  </th>
                  <th 
                    className="border-b px-4 py-3 text-right text-sm font-medium text-gray-500 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("subject")}
                  >
                    المادة {renderSortIcon("subject")}
                  </th>
                  <th 
                    className="border-b px-4 py-3 text-right text-sm font-medium text-gray-500 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("teacher")}
                  >
                    الأستاذ {renderSortIcon("teacher")}
                  </th>
                  <th 
                    className="border-b px-4 py-3 text-right text-sm font-medium text-gray-500 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("time")}
                  >
                    الوقت {renderSortIcon("time")}
                  </th>
                  <th className="border-b px-4 py-3 text-right text-sm font-medium text-gray-500">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredAndSortedSchedules.map((schedule, index) => (
                  <tr key={schedule.id || index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-500">{index + 1}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{schedule.day}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{schedule.class}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{schedule.subject}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{schedule.teacher}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{schedule.time}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex space-x-2 space-x-reverse">
                        <button
                          className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-colors flex items-center text-xs"
                          onClick={() => handleEdit(schedule)}
                        >
                          <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          تعديل
                        </button>
                        <button
                          className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition-colors flex items-center text-xs"
                          onClick={() => handleDelete(schedule.id)}
                        >
                          <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {filteredAndSortedSchedules.length > 0 && (
          <div className="mt-4 text-gray-500 text-sm">
            إجمالي الجداول: {filteredAndSortedSchedules.length}
          </div>
        )}
      </div>
    </div>
  );
}