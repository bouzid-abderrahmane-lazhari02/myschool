import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "./firebase";

function EventsPage() {
  const [editingId, setEditingId] = useState(null);

  const [events, setEvents] = useState([]);
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
    const snapshot = await getDocs(collection(db, "events"));
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setEvents(data);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleAdd = async () => {
    await addDoc(collection(db, "events"), {
      title: form.title,
      type: form.type,
      date: form.date,
      time: form.time,
      target: {
        level: form.level,
        stream: form.stream,
        class: form.class,
      },
    });
    // هنا تقدر ترسل إشعار
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

  const handleUpdate = async () => {
    if (!editingId) return;

    // eslint-disable-next-line no-undef
    await updateDoc(doc(db, "events", editingId), {
      title: form.title,
      type: form.type,
      date: form.date,
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

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">إدارة الفعاليات</h2>

      {/* النموذج */}
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
        {editingId ? (
          <button
            className="col-span-2 bg-blue-600 text-white rounded px-4 py-2"
            onClick={handleUpdate}
          >
            تحديث الفعالية
          </button>
        ) : (
          <button
            className="col-span-2 bg-green-600 text-white rounded px-4 py-2"
            onClick={handleAdd}
          >
            إضافة فعالية
          </button>
        )}
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
          {events.map((event) => (
            <tr key={event.id}>
              <td className="border px-4 py-2">{event.title}</td>
              <td className="border px-4 py-2">{event.type}</td>
              <td className="border px-4 py-2">{event.date}</td>
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
                      date: event.date,
                      time: event.time,
                      level: event.target?.level || "",
                      stream: event.target?.stream || "",
                      class: event.target?.class || "",
                    });
                    setEditingId(event.id);
                  }}
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
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default EventsPage;
