import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp
} from "firebase/firestore";
import { db } from "./firebase";
import { useNavigate } from "react-router-dom";

function EventsPage() {
  const [editingId, setEditingId] = useState(null);
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    type: "فرض",
    date: "",
    time: "",
    level: "",
    stream: "",
    class: "",
  });

  const fetchEvents = async () => {
    try {
      // إنشاء تاريخ اليوم في بداية اليوم
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // استعلام لجلب جميع الفعاليات وترتيبها حسب التاريخ
      const eventsQuery = query(
        collection(db, "events"),
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

  const handleUpdate = async () => {
    if (!editingId) return;

    await updateDoc(doc(db, "events", editingId), {
      title: form.title,
      type: form.type,
      date: form.date ? new Date(form.date) : null,
      time: form.time,
      target: {
        level: form.level,
        stream: form.stream,
        class: form.class,
      },
    });

    setEditingId(null);
    setForm({
      title: "",
      type: "فرض",
      date: "",
      time: "",
      level: "",
      stream: "",
      class: "",
    });
    fetchEvents();
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "events", id));
    fetchEvents();
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
        <h2 className="text-xl font-bold">الفعاليات القادمة</h2>
        <button 
          onClick={navigateToAddEvent}
          className="bg-sky-500 text-white px-4 py-2 rounded-lg hover:bg-sky-600 transition-colors flex items-center"
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
                    onClick={() => {
                      setForm({
                        title: event.title,
                        type: event.type,
                        date: event.date instanceof Timestamp 
                          ? event.date.toDate().toISOString().split('T')[0]
                          : event.date instanceof Date 
                            ? event.date.toISOString().split('T')[0]
                            : event.date,
                        time: event.time,
                        level: event.target?.level || "",
                        stream: event.target?.stream || "",
                        class: event.target?.class || "",
                      });
                      setEditingId(event.id);
                    }}
                    className="bg-green-500 text-white px-2 py-1 rounded"
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

      {/* النموذج للتعديل فقط */}
      {editingId && (
        <div className="mt-6 p-4 border border-gray-300 rounded-lg">
          <h3 className="text-lg font-bold mb-4">تعديل الفعالية</h3>
          <div className="grid grid-cols-2 gap-2 mb-4">
            <input
              placeholder="اسم الفعالية"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="border px-2 py-1"
            />
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="border px-2 py-1"
            >
              <option>فرض</option>
              <option>نشاط</option>
            </select>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="border px-2 py-1"
            />
            <input
              type="time"
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
              className="border px-2 py-1"
            />
            <input
              placeholder="السنة (مثلاً: سنة أولى)"
              value={form.level}
              onChange={(e) => setForm({ ...form, level: e.target.value })}
              className="border px-2 py-1"
            />
            <input
              placeholder="الشعبة (مثلاً: علوم)"
              value={form.stream}
              onChange={(e) => setForm({ ...form, stream: e.target.value })}
              className="border px-2 py-1"
            />
            <input
              placeholder="القسم (مثلاً: 1AS-A)"
              value={form.class}
              onChange={(e) => setForm({ ...form, class: e.target.value })}
              className="border px-2 py-1"
            />
            <button
              className="col-span-2 bg-sky-500 text-white rounded px-4 py-2"
              onClick={handleUpdate}
            >
              تحديث الفعالية
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default EventsPage;
