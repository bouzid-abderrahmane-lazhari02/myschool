// تعديل مكون Dashboard لإزالة شريط التنقل المكرر
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const Dashboard = () => {
  const navigate = useNavigate();
  const [teachersCount, setTeachersCount] = useState(0);
  const [studentsCount, setStudentsCount] = useState(0);
  const [schedulesCount, setSchedulesCount] = useState(0);
  const [eventsCount, setEventsCount] = useState(0);
  const [schedulesData, setSchedulesData] = useState([]); // إضافة متغير حالة جديد

  // استدعاء عدد المعلمين والتلاميذ والجداول عند تحميل الصفحة
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const teachersSnapshot = await getDocs(collection(db, "teachers"));
        setTeachersCount(teachersSnapshot.docs.length);
        
        const studentsSnapshot = await getDocs(collection(db, "students"));
        setStudentsCount(studentsSnapshot.docs.length);
        
        // جلب بيانات الجداول لعرضها في الصفحة الرئيسية
        const schedulesSnapshot = await getDocs(collection(db, "schedules"));
        setSchedulesCount(schedulesSnapshot.docs.length);
        
        // جلب عدد الفعاليات
        const eventsSnapshot = await getDocs(collection(db, "events"));
        setEventsCount(eventsSnapshot.docs.length);
        
        const schedulesData = schedulesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // عرض أحدث 3 جداول فقط
        const latestSchedules = schedulesData.slice(0, 3);
        setSchedulesData(latestSchedules);
      } catch (error) {
        console.error("خطأ في جلب البيانات:", error);
      }
    };

    fetchCounts();
  }, []);

  // دالة للانتقال إلى صفحة الأساتذة
  const navigateToTeachers = () => {
    navigate('/teachers');
  };

  // دالة للانتقال إلى صفحة التلاميذ
  const navigateToStudents = () => {
    navigate('/students');
  };
  
  // دالة للانتقال إلى صفحة الجداول
  const navigateToSchedules = () => {
    navigate('/schedules');
  };
  
  // دالة للانتقال إلى صفحة الفعاليات
  const navigateToEvents = () => {
    navigate('/events');
  };

  return (
    <div className="dashboard-container">
      {/* محتوى لوحة التحكم بدون شريط تنقل */}
      <h1 className="text-2xl font-bold mb-6">لوحة التحكم</h1>
      
      {/* إحصائيات وبيانات لوحة التحكم */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md cursor-pointer hover:bg-gray-50" onClick={navigateToStudents}>
          <h2 className="text-lg font-semibold mb-2">إجمالي الطلاب</h2>
          <p className="text-3xl font-bold text-blue-600">{studentsCount}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md cursor-pointer hover:bg-gray-50" onClick={navigateToTeachers}>
          <h2 className="text-lg font-semibold mb-2">إجمالي المعلمين</h2>
          <p className="text-3xl font-bold text-sky-500">{teachersCount}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md cursor-pointer hover:bg-gray-50" onClick={navigateToSchedules}>
          <h2 className="text-lg font-semibold mb-2">الجداول الدراسية</h2>
          <p className="text-3xl font-bold text-purple-600">{schedulesCount}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md cursor-pointer hover:bg-gray-50" onClick={navigateToEvents}>
          <h2 className="text-lg font-semibold mb-2">الفعاليات القادمة</h2>
          <p className="text-3xl font-bold text-sky-500">{eventsCount}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;