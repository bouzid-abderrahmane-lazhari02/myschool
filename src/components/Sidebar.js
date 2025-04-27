import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();
  
  // قائمة الصفحات المتاحة في التطبيق
  const pages = [
    { name: "الرئيسية", path: "/dashboard", icon: "home" },
    { name: "التلاميذ", path: "/students", icon: "people" },
    { name: "الأساتذة", path: "/teachers", icon: "school" },
    { name: "الفعاليات", path: "/events", icon: "event" },
    { name: "الجدول الدراسي", path: "/schedules", icon: "schedule" },
  ];

  return (
    <div className="w-44 bg-blue-500 text-white h-screen">
      <div className="p-6 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      </div>
      
      <div className="text-center text-xl font-bold mb-8">
        مدرستي
      </div>
      
      <nav className="flex flex-col">
        {pages.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`py-4 px-6 text-center ${location.pathname === item.path ? 'bg-blue-600 hover:bg-blue-700' : 'hover:bg-blue-600'} transition-colors`}
          >
            {item.name}
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;