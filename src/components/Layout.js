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
