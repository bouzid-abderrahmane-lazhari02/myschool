import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  Timestamp
} from "firebase/firestore";
import { db } from "./firebase";
import { useNavigate } from "react-router-dom";

function EventsPage() {
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  // استخراج معرف المدرسة من التخزين المحلي أو استخدام قيمة افتراضية
  const schoolId = localStorage.getItem('schoolId') || "defaultSchool";

  const fetchEvents = async () => {
    try {
      // إنشاء تاريخ اليوم في بداية اليوم
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // استعلام لجلب جميع الفعاليات وترتيبها حسب التاريخ
      // تعديل المسار ليكون school/schoolId/events
      const eventsQuery = query(
        collection(db, "school", schoolId, "events"),
        orderBy("date", "asc")
      );
      
      const snapshot = await getDocs(eventsQuery);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setEvents(data);
    } catch (error) {
      console.error("خطأ في جلب الفعاليات:", error);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDelete = async (id) => {
    // تعديل المسار ليكون school/schoolId/events
    await deleteDoc(doc(db, "school", schoolId, "events", id));
    fetchEvents();
  };

  // دالة جديدة للانتقال إلى صفحة تعديل الفعالية
  const navigateToEditEvent = (event) => {
    // تحويل التاريخ إلى تنسيق مناسب للنموذج
    const formattedDate = event.date instanceof Timestamp 
      ? event.date.toDate().toISOString().split('T')[0]
      : event.date instanceof Date 
        ? event.date.toISOString().split('T')[0]
        : event.date;
    
    // إنشاء كائن الفعالية للتعديل
    const eventToEdit = {
      id: event.id,
      title: event.title,
      type: event.type,
      date: formattedDate,
      time: event.time,
      target: event.target || 'all',
      targets: event.targets || [],
      schoolId: event.schoolId || schoolId
    };
    
    // تخزين بيانات الفعالية في التخزين المحلي
    localStorage.setItem('editEvent', JSON.stringify(eventToEdit));
    
    // الانتقال إلى صفحة إضافة الفعالية
    navigate('/events/add');
  };

  // تصفية الفعاليات بناءً على البحث
  const filteredEvents = events.filter(event => 
    event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.target?.level?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.target?.stream?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.target?.class?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // دالة للانتقال إلى صفحة إضافة فعالية
  const navigateToAddEvent = () => {
    navigate('/events/add');
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-blue-800">الفعاليات القادمة</h1>
        <button 
          onClick={navigateToAddEvent}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center"
        >
          <span className="mr-2">+</span>
          إضافة فعالية
        </button>
      </div>

      {/* حقل البحث */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="ابحث عن فعالية..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400"
        />
      </div>

      {/* عرض الفعاليات */}
      <table className="w-full border border-gray-300 table-auto">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-4 py-2">الاسم</th>
            <th className="border px-4 py-2">النوع</th>
            <th className="border px-4 py-2">التاريخ</th>
            <th className="border px-4 py-2">الوقت</th>
            <th className="border px-4 py-2">الموجهة إلى</th>
            <th className="border px-4 py-2">إجراء</th>
          </tr>
        </thead>
        <tbody>
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <tr key={event.id}>
                <td className="border px-4 py-2">{event.title}</td>
                <td className="border px-4 py-2">{event.type}</td>
                <td className="border px-4 py-2">
                  {event.date instanceof Timestamp 
                    ? event.date.toDate().toLocaleDateString() 
                    : event.date instanceof Date 
                      ? event.date.toLocaleDateString() 
                      : event.date}
                </td>
                <td className="border px-4 py-2">{event.time}</td>
                <td className="border px-4 py-2">
                  {event.target?.level || "الكل"} / {event.target?.stream || "-"}{" "}
                  / {event.target?.class || "-"}
                </td>
                <td className="border px-4 py-2 flex gap-2">
                  <button
                    onClick={() => navigateToEditEvent(event)}
                    className="bg-blue-500 text-white px-2 py-1 rounded"
                  >
                    تعديل
                  </button>
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    حذف
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="border px-4 py-2 text-center">
                لا توجد فعاليات قادمة
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default EventsPage;
