import { useState, useEffect } from "react";
import { doc, setDoc, collection } from "firebase/firestore";
import { db } from "../../firebase"; // تأكد أن db معرف من firebase config
import { useNavigate } from "react-router-dom";

const hours = [
  "08:00 - 09:00", "09:00 - 10:00", "10:00 - 11:00",
  "11:00 - 12:00", "14:00 - 15:00",
  "15:00 - 16:00", "16:00 - 17:00",
];

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];

function ScheduleForm() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [scheduleId, setScheduleId] = useState(null);
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

  // التحقق مما إذا كان هناك بيانات جدول للتعديل
  useEffect(() => {
    const editScheduleData = localStorage.getItem('editSchedule');
    if (editScheduleData) {
      try {
        const parsedData = JSON.parse(editScheduleData);
        setScheduleId(parsedData.id);
        setIsEditing(true);
        
        // استخراج البيانات من الجدول المراد تعديله
        if (parsedData.class) {
          const classParts = parsedData.class.split('/');
          if (classParts.length >= 3) {
            setYear(classParts[0] || "");
            setBranch(classParts[1] || "");
            setSection(classParts[2] || "");
          }
        }
        
        // استخراج معرف المدرسة
        setSchoolId(parsedData.schoolId || localStorage.getItem("schoolId") || "");
        
        // محاولة ملء خانات الجدول بناءً على البيانات المتاحة
        // هنا نفترض أن هناك بيانات مخزنة في مكان ما في قاعدة البيانات
        // يمكننا استرجاعها باستخدام معرف الجدول
        
        // مثال: إذا كان لدينا بيانات في parsedData.scheduleData
        if (parsedData.scheduleData) {
          setSchedule(parsedData.scheduleData);
        } else {
          // محاولة ملء الخانة المناسبة بناءً على اليوم والوقت
          const newSchedule = [...schedule];
          const dayIndex = days.findIndex(d => d.toLowerCase() === parsedData.day?.toLowerCase());
          const timeIndex = hours.findIndex(h => h === parsedData.time);
          
          if (dayIndex !== -1 && timeIndex !== -1) {
            // إذا وجدنا اليوم والوقت، نملأ الخانة المناسبة
            newSchedule[timeIndex][days[dayIndex]] = `${parsedData.subject} - ${parsedData.teacher}`;
            setSchedule(newSchedule);
          }
        }
        
        // حذف البيانات من التخزين المحلي بعد استخدامها
        localStorage.removeItem('editSchedule');
      } catch (error) {
        console.error("خطأ في تحليل بيانات الجدول:", error);
      }
    }
  }, []);

  const handleChange = (hourIndex, day, value) => {
    const newSchedule = [...schedule];
    newSchedule[hourIndex][day] = value;
    setSchedule(newSchedule);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // استخدام معرف المدرسة من الحقل أو من التخزين المحلي
      const currentSchoolId = schoolId || localStorage.getItem("schoolId") || "default";
      
      // إضافة الجدول إلى المسار الأصلي
      const path = `school/${currentSchoolId}/years/${year}/branches/${branch}/sectoins/${section}`;
      const docRef = doc(db, path);
      await setDoc(docRef, { schedule });
  
      // إضافة أو تحديث الجدول في مجموعة schedules للعرض في الصفحة الرئيسية
      let scheduleRef;
      
      if (isEditing && scheduleId) {
        // تحديث الجدول الموجود
        scheduleRef = doc(db, "schedules", scheduleId);
      } else {
        // إضافة جدول جديد
        scheduleRef = doc(collection(db, "schedules"));
      }
      
      await setDoc(scheduleRef, {
        day: "الأحد", // يمكنك تعديل هذا حسب احتياجاتك
        class: `${year}/${branch}/${section}`,
        subject: "المادة", // يمكنك تعديل هذا حسب احتياجاتك
        teacher: "الأستاذ", // يمكنك تعديل هذا حسب احتياجاتك
        time: "08:00 - 09:00", // يمكنك تعديل هذا حسب احتياجاتك
        schoolId: currentSchoolId,
        createdAt: new Date().toISOString(),
        // تخزين بيانات الجدول كاملة لاستخدامها في التعديل لاحقًا
        scheduleData: schedule
      }, { merge: true });
  
      alert(isEditing ? "✅ تم تعديل الجدول بنجاح!" : "✅ تم حفظ الجدول بنجاح!");
      navigate('/schedules'); // العودة إلى صفحة الجداول بعد الإضافة أو التعديل
    } catch (error) {
      console.error("خطأ في حفظ الجدول:", error);
      alert("❌ حدث خطأ أثناء حفظ الجدول!");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded-xl shadow-xl overflow-auto max-w-6xl mx-auto mt-10">
      <h2 className="text-2xl font-bold text-center mb-6 text-sky-700">
        {isEditing ? "📝 تعديل جدول الحصص" : "📚 إضافة جدول الحصص"}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <input type="text" placeholder="معرف المدرسة" value={schoolId} onChange={(e) => setSchoolId(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 text-sm" />
        <input type="text" placeholder="السنة الدراسية (مثلاً 1)" value={year} onChange={(e) => setYear(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 text-sm" />
        <input type="text" placeholder="الشعبة (مثلاً SE)" value={branch} onChange={(e) => setBranch(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 text-sm" />
        <input type="text" placeholder="القسم (مثلاً 1a)" value={section} onChange={(e) => setSection(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 text-sm" />
      </div>

      <div className="overflow-auto">
        <table className="table-auto w-full border border-gray-300 text-center">
          <thead>
            <tr className="bg-green-100 text-green-800">
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

      <div className="flex justify-center mt-6 gap-4">
        <button type="submit" className="bg-sky-600 text-white px-6 py-2 rounded-lg hover:bg-sky-700 transition-all">
          {isEditing ? "💾 حفظ التعديلات" : "💾 حفظ الجدول"}
        </button>
        <button 
          type="button" 
          className="bg-gray-300 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-400 transition-all"
          onClick={() => navigate('/schedules')}
        >
          ❌ إلغاء
        </button>
      </div>
    </form>
  );
}

export default ScheduleForm;
