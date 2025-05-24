// تعديل مكون Dashboard لإزالة شريط التنقل المكرر
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, collectionGroup, where } from 'firebase/firestore';
import { db } from '../firebase';

const Dashboard = () => {
  const navigate = useNavigate();
  const [teachersCount, setTeachersCount] = useState(0);
  const [studentsCount, setStudentsCount] = useState(0);
  const [schedulesCount, setSchedulesCount] = useState(0);
  const [eventsCount, setEventsCount] = useState(0);
  const [absencesCount, setAbsencesCount] = useState(0);
  const [sectionsCount, setSectionsCount] = useState(0); // عدد الأقسام
  const [branchesCount, setBranchesCount] = useState(0); // عدد الشعب
  const [schedulesData, setSchedulesData] = useState([]);
  
  // استخراج معرف المدرسة من التخزين المحلي أو استخدام قيمة افتراضية
  const schoolId = localStorage.getItem('schoolId') || "defaultSchool";

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
        
        // جلب عدد الفعاليات من المسار الصحيح
        const eventsSnapshot = await getDocs(collection(db, "school", schoolId, "events"));
        setEventsCount(eventsSnapshot.docs.length);
        
        // جلب عدد الغيابات من جميع الطلاب
        const absencesSnapshot = await getDocs(collectionGroup(db, "absences"));
        setAbsencesCount(absencesSnapshot.docs.length);
        
        // جلب عدد الأقسام والشعب من المسار الصحيح بشكل منفصل
        let totalSections = 0;
        let totalBranches = 0;
        
        // أولاً، نجلب جميع السنوات الدراسية
        const yearsSnapshot = await getDocs(collection(db, "school", schoolId, "years"));
        
        // لكل سنة دراسية، نجلب الشعب
        for (const yearDoc of yearsSnapshot.docs) {
          const branchesSnapshot = await getDocs(collection(db, "school", schoolId, "years", yearDoc.id, "branches"));
          
          // إضافة عدد الشعب للعداد الإجمالي
          totalBranches += branchesSnapshot.docs.length;
          
          // لكل شعبة، نجلب الأقسام
          for (const branchDoc of branchesSnapshot.docs) {
            // تصحيح اسم المجموعة من "sections" إلى "sectoins" (حسب الهيكل الفعلي في قاعدة البيانات)
            const sectionsSnapshot = await getDocs(collection(db, "school", schoolId, "years", yearDoc.id, "branches", branchDoc.id, "sectoins"));
            totalSections += sectionsSnapshot.docs.length;
          }
        }
        
        // تعيين عدد الأقسام والشعب بشكل منفصل
        setSectionsCount(totalSections);
        setBranchesCount(totalBranches);
        
        const schedulesData = schedulesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // عرض أحدث 3 جداول فقط
        const latestSchedules = schedulesData.slice(0, 3);
        setSchedulesData(latestSchedules);
      } catch (error) {
        console.error("خطأ في جلب البيانات:", error);
      }
    };

    fetchCounts();
  }, [schoolId]); // إضافة schoolId كتبعية للتأثير

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
  
  // دالة للانتقال إلى صفحة الغيابات
  const navigateToAbsences = () => {
    navigate('/attendance');
  };
  
  // دالة للانتقال إلى صفحة الأقسام
  const navigateToClasses = () => {
    navigate('/classes');
  };

  // دالة للانتقال إلى صفحة الشعب
  const navigateToBranches = () => {
    navigate('/classes'); // تعديل المسار ليكون مناسبًا لصفحة الشعب
  };

  return (
    <div className="dashboard-container">
      {/* محتوى لوحة التحكم بدون شريط تنقل */}
      <h1 className="text-2xl font-bold mb-6">لوحة التحكم</h1>
      
      {/* إحصائيات وبيانات لوحة التحكم */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md cursor-pointer hover:bg-gray-50" onClick={navigateToStudents}>
          <h2 className="text-lg font-semibold mb-2">إجمالي الطلاب</h2>
          <p className="text-3xl font-bold text-blue-600">{studentsCount}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md cursor-pointer hover:bg-gray-50" onClick={navigateToTeachers}>
          <h2 className="text-lg font-semibold mb-2">إجمالي المعلمين</h2>
          <p className="text-3xl font-bold text-sky-500">{teachersCount}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md cursor-pointer hover:bg-gray-50" onClick={navigateToClasses}>
          <h2 className="text-lg font-semibold mb-2">الأقسام</h2>
          <p className="text-3xl font-bold text-green-600">{sectionsCount}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md cursor-pointer hover:bg-gray-50" onClick={navigateToBranches}>
          <h2 className="text-lg font-semibold mb-2">الشعب</h2>
          <p className="text-3xl font-bold text-yellow-600">{branchesCount}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md cursor-pointer hover:bg-gray-50" onClick={navigateToSchedules}>
          <h2 className="text-lg font-semibold mb-2">الجداول الدراسية</h2>
          <p className="text-3xl font-bold text-purple-600">{schedulesCount}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md cursor-pointer hover:bg-gray-50" onClick={navigateToEvents}>
          <h2 className="text-lg font-semibold mb-2">الفعاليات القادمة</h2>
          <p className="text-3xl font-bold text-sky-500">{eventsCount}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md cursor-pointer hover:bg-gray-50" onClick={navigateToAbsences}>
          <h2 className="text-lg font-semibold mb-2">إجمالي الغيابات</h2>
          <p className="text-3xl font-bold text-red-600">{absencesCount}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;