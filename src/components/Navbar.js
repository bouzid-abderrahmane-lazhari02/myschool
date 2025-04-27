import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-sky-500 text-white p-4">
      <div className="flex flex-col space-y-4">
        <NavLink 
          to="/dashboard" 
          className={({ isActive }) => 
            isActive 
              ? "bg-sky-700 text-white px-3 py-2 rounded-md" 
              : "text-white hover:bg-sky-600 px-3 py-2 rounded-md"
          }
        >
          لوحة التحكم
        </NavLink>
        
        <button className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg">
          زر إضافي
        </button>
        
        <div className="relative">
          <button className="text-white hover:bg-sky-600 px-3 py-2 rounded-md">
            قائمة منسدلة
          </button>
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-sky-200 hidden">
            {/* محتوى القائمة المنسدلة */}
            <a href="#" className="block px-4 py-2 text-gray-800 hover:bg-sky-100">خيار 1</a>
            <a href="#" className="block px-4 py-2 text-gray-800 hover:bg-sky-100">خيار 2</a>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;