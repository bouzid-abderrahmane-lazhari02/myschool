import React from 'react';
import { Outlet } from 'react-router-dom';

// استيراد مكون الشريط الجانبي
import Sidebar from './Sidebar';

const Layout = () => {
  return (
    <div className="flex h-screen bg-gray-100" dir="rtl">
      {/* الشريط الجانبي */}
      <Sidebar />
      
      {/* المحتوى الرئيسي */}
      <div className="flex-1 p-6 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;

<nav className="bg-sky-500 text-white p-4">
  {/* الشريط الجانبي */}
  <Sidebar />
  
  {/* المحتوى الرئيسي */}
  <div className="flex-1 p-6 overflow-y-auto">
    <Outlet />
  </div>
</nav>

// إضافة رابط سجل الغياب في قائمة الروابط
const navLinks = [
  { to: '/dashboard', icon: 'dashboard', text: 'لوحة التحكم' },
  { to: '/students', icon: 'school', text: 'الطلاب' },
  { to: '/teachers', icon: 'person', text: 'المعلمين' },
  { to: '/schedules', icon: 'schedule', text: 'الجداول الدراسية' },
  { to: '/absences', icon: 'event_busy', text: 'سجل الغيابات' }, // إضافة رابط سجل الغياب
  { to: '/events', icon: 'event', text: 'الفعاليات' },
];
