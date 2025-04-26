// src/pages/Dashboard.js
// export default function Dashboard() {
//     return (
//       <div className="p-10">
//         <h1 className="text-2xl font-bold">مرحبا بك في لوحة التحكم</h1>
//       </div>
//     );
//   }
// src/pages/Dashboard.js
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [greeting, setGreeting] = useState("");
  
  useEffect(() => {
    // تحديد التحية بناءً على وقت اليوم
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("صباح الخير");
    else if (hour < 18) setGreeting("مساء الخير");
    else setGreeting("مساء السعادة");
  }, []);

  // قائمة الصفحات المتاحة في التطبيق
  const pages = [
    { name: "الرئيسية", path: "/dashboard", icon: "home" },
    { name: "التلاميذ", path: "/students", icon: "people" },
    { name: "الأساتذة", path: "/teachers", icon: "school" },
    { name: "الفعاليات", path: "/events", icon: "event" },
    { name: "الجدول الدراسي", path: "/schedule", icon: "schedule" },
  ];

  // بيانات الجدول الدراسي
  const scheduleData = [
    { id: 1, time: "08:00 - 09:00", subject: "رياضيات" },
    { id: 2, time: "09:00 - 10:00", subject: "لغة عربية" },
    { id: 3, time: "10:00 - 11:00", subject: "لغة إنجليزية" },
  ];

  // بيانات الإشعارات
  const notifications = [
    "تنبيه بموعد الدرس القادم",
    "تم إضافة حصة في الجدول",
    "تم إرسال إشعار جديد"
  ];

  return (
    <div className="flex h-screen bg-gray-100" dir="rtl">
      {/* القائمة الجانبية */}
      <div className="w-48 bg-blue-600 text-white">
        <div className="p-6 bg-blue-700 flex items-center justify-center">
          <i className="material-icons text-3xl ml-2">menu_book</i>
          <h1 className="text-xl font-bold">مدرستي</h1>
        </div>
        
        <nav>
          {pages.map((item, index) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center py-4 px-6 ${index === 0 ? 'bg-blue-700' : ''} hover:bg-blue-700 transition-colors`}
            >
              <span className="text-lg">{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* المحتوى الرئيسي */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">لوحة التحكم</h1>
            <h2 className="text-2xl font-bold text-blue-600">مدرستي</h2>
          </div>

          {/* الإحصائيات */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg border border-gray-200 p-6 flex flex-col items-center">
              <p className="text-4xl font-bold mb-2">250</p>
              <h3 className="text-gray-500">عدد التلاميذ</h3>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6 flex flex-col items-center">
              <p className="text-4xl font-bold mb-2">20</p>
              <h3 className="text-gray-500">عدد الأساتذة</h3>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6 flex flex-col items-center">
              <p className="text-4xl font-bold mb-2">3</p>
              <h3 className="text-gray-500">عدد الفعاليات القادمة</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* الجدول الدراسي */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-xl font-bold mb-4">الجدول الدراسي لليوم</h3>
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 text-right">الحصة</th>
                    <th className="py-2 text-right">الوقت</th>
                    <th className="py-2 text-right">المادة</th>
                  </tr>
                </thead>
                <tbody>
                  {scheduleData.map((item) => (
                    <tr key={item.id} className="border-b">
                      <td className="py-3">{item.id}</td>
                      <td className="py-3">{item.time}</td>
                      <td className="py-3">{item.subject}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-6">
              {/* الإشعارات */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-xl font-bold mb-4">الإشعارات</h3>
                <ul className="space-y-3">
                  {notifications.map((notification, index) => (
                    <li key={index} className="flex items-center">
                      <span className="inline-block w-2 h-2 rounded-full bg-blue-500 ml-2"></span>
                      {notification}
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* كشف نقاط التلميذ */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-xl font-bold mb-4">كشف نقاط التلميذ</h3>
                <div className="space-y-4">
                  <div className="h-px bg-gray-200"></div>
                  <div className="h-px bg-gray-200"></div>
                  <div className="h-px bg-gray-200"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}  