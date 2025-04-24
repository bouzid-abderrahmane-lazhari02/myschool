import { useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../firebase"; // تأكد أن db معرف من firebase config

const hours = [
  "08:00 - 09:00", "09:00 - 10:00", "10:00 - 11:00",
  "11:00 - 12:00", "14:00 - 15:00",
  "15:00 - 16:00", "16:00 - 17:00",
];

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];

function ScheduleForm() {
  const [schoolId, setSchoolId] = useState("");
  const [year, setYear] = useState("");
  const [branch, setBranch] = useState("");
  const [section, setSection] = useState("");

  const [schedule, setSchedule] = useState(() =>
    hours.map((time) => {
      const obj = { time };
      days.forEach((day) => (obj[day] = ""));
      return obj;
    })
  );

  const handleChange = (hourIndex, day, value) => {
    const newSchedule = [...schedule];
    newSchedule[hourIndex][day] = value;
    setSchedule(newSchedule);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const path = `school/${schoolId}/years/${year}/branches/${branch}/sectoins/${section}`;
    const docRef = doc(db, path);
    await setDoc(docRef, { schedule });

    alert("✅ تم حفظ الجدول بنجاح!");
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded-xl shadow-xl overflow-auto max-w-6xl mx-auto mt-10">
      <h2 className="text-2xl font-bold text-center mb-6 text-blue-700">📚 إضافة جدول الحصص</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <input type="text" placeholder="معرف المدرسة" value={schoolId} onChange={(e) => setSchoolId(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm" />
        <input type="text" placeholder="السنة الدراسية (مثلاً 1)" value={year} onChange={(e) => setYear(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm" />
        <input type="text" placeholder="الشعبة (مثلاً SE)" value={branch} onChange={(e) => setBranch(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm" />
        <input type="text" placeholder="القسم (مثلاً 1a)" value={section} onChange={(e) => setSection(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm" />
      </div>

      <div className="overflow-auto">
        <table className="table-auto w-full border border-gray-300 text-center">
          <thead>
            <tr className="bg-blue-100 text-blue-800">
              <th className="border p-2">الوقت</th>
              {days.map((day) => (
                <th key={day} className="border p-2">{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {schedule.map((row, hourIndex) => (
              <tr key={hourIndex}>
                <td className="border p-2 font-semibold bg-gray-50">{row.time}</td>
                {days.map((day) => (
                  <td key={day} className="border p-1">
                    <input
                      type="text"
                      value={row[day]}
                      onChange={(e) => handleChange(hourIndex, day, e.target.value)}
                      className="input-field text-sm"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center mt-6">
        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all">
          💾 حفظ الجدول
        </button>
      </div>
    </form>
  );
}

export default ScheduleForm;
