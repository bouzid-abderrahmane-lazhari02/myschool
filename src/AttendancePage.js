import React, { useEffect, useState } from "react";
import { collection, getDocs, addDoc, query, where, doc, getDoc, deleteDoc, updateDoc, collectionGroup } from "firebase/firestore";
import { db } from "./firebase";
import { useNavigate, useLocation } from "react-router-dom";

export default function AttendancePage() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [manualStudentId, setManualStudentId] = useState("");
  const [useManualId, setUseManualId] = useState(true); // تغيير القيمة الافتراضية إلى true
  const [absenceData, setAbsenceData] = useState({
    time: "",
    day: "",
    reason: ""
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [absences, setAbsences] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchStudents();
    
    // التحقق من وجود معلمات في عنوان URL للتعديل
    const params = new URLSearchParams(location.search);
    const editId = params.get('edit');
    const studentId = params.get('studentId');
    
    if (editId && studentId) {
      fetchAbsenceForEdit(editId, studentId);
    }
  }, [location]);

  const fetchAbsenceForEdit = async (absenceId, studentId) => {
    try {
      // التحقق من وجود معلمة fullPath في عنوان URL
      const params = new URLSearchParams(location.search);
      const fullPath = params.get('fullPath');
      
      let absenceDoc;
      
      if (fullPath) {
        // استخدام المسار الكامل إذا كان متوفرًا
        absenceDoc = await getDoc(doc(db, fullPath));
      } else {
        // استخدام المسار التقليدي إذا لم يكن المسار الكامل متوفرًا
        absenceDoc = await getDoc(doc(db, `students/${studentId}/absences`, absenceId));
      }
      
      if (absenceDoc.exists()) {
        const absenceData = absenceDoc.data();
        setEditingId(absenceId);
        setAbsenceData({
          time: absenceData.time || "",
          day: absenceData.day || "",
          reason: absenceData.reason || ""
        });
        
        // تعيين معرف الطالب
        setManualStudentId(studentId);
        setUseManualId(true);
      } else {
        setError("لم يتم العثور على سجل الغياب المطلوب");
      }
    } catch (error) {
      console.error("خطأ في جلب بيانات الغياب للتعديل:", error);
      setError("حدث خطأ أثناء محاولة جلب بيانات الغياب للتعديل");
    }
  };

  const fetchStudents = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "students"));
      const studentData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStudents(studentData);
    } catch (error) {
      console.error("خطأ في جلب بيانات الطلاب:", error);
      setError("حدث خطأ أثناء جلب بيانات الطلاب");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAbsenceData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStudentChange = (e) => {
    setSelectedStudent(e.target.value);
  };

  const handleManualIdChange = (e) => {
    setManualStudentId(e.target.value);
  };

  const toggleIdInputMethod = () => {
    setUseManualId(!useManualId);
    setSelectedStudent("");
    setManualStudentId("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    // تحديد معرف الطالب المستخدم (إما المحدد من القائمة أو المدخل يدويًا)
    const studentId = useManualId ? manualStudentId : selectedStudent;
    
    if (!studentId || !absenceData.time || !absenceData.day || !absenceData.reason) {
      setError("يرجى ملء جميع الحقول المطلوبة");
      return;
    }
  
    setLoading(true);
    
    try {
      // التحقق من وجود الطالب إذا تم إدخال المعرف يدويًا
      if (useManualId) {
        const studentDoc = await getDoc(doc(db, "students", manualStudentId));
        if (!studentDoc.exists()) {
          setError("لم يتم العثور على طالب بهذا المعرف");
          setLoading(false);
          return;
        }
      }
      
      if (editingId) {
        // تحديث سجل غياب موجود
        await updateDoc(doc(db, `students/${studentId}/absences`, editingId), {
          time: absenceData.time,
          day: absenceData.day,
          reason: absenceData.reason,
          updatedAt: new Date()
        });
        
        setEditingId(null);
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          // العودة إلى صفحة سجلات الغياب بعد التعديل
          navigate('/absences');
        }, 1500);
        
      } else {
        // إضافة سجل غياب جديد
        // الحصول على معلومات الطالب من الوثيقة المحددة
        const studentDoc = await getDoc(doc(db, "students", studentId));
        let studentName = "غير معروف";
        if (studentDoc.exists()) {
          studentName = studentDoc.data().fullName || "غير معروف";
        }
        
        // إنشاء معرف فريد لسجل الغياب (مختلف عن معرف الطالب)
        const absenceUniqueId = `abs_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        
        // إضافة سجل الغياب إلى المجموعة الفرعية للطالب
        await addDoc(collection(db, `students/${studentId}/absences`), {
          id: absenceUniqueId, // استخدام معرف فريد بدلاً من معرف الطالب
          studentId: studentId, // تخزين معرف الطالب بشكل منفصل
          studentName: studentName, // تخزين اسم الطالب للرجوع إليه لاحقًا
          time: absenceData.time,
          day: absenceData.day,
          reason: absenceData.reason,
          status: "pending", // إضافة حالة التبرير الافتراضية (معلق)
          createdAt: new Date()
        });
        
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          // العودة إلى صفحة سجلات الغياب بعد الإضافة
          navigate('/absences');
        }, 1500);
      }
      
      // إعادة تعيين النموذج
      setAbsenceData({
        time: "",
        day: "",
        reason: ""
      });
      
      if (!editingId) {
        setSelectedStudent("");
        setManualStudentId("");
      }
      
    } catch (error) {
      console.error("خطأ في إضافة/تعديل سجل الغياب:", error);
      setError("حدث خطأ أثناء محاولة تسجيل/تعديل الغياب");
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setAbsenceData({
      time: "",
      day: "",
      reason: ""
    });
    setSelectedStudent("");
    setManualStudentId("");
    // العودة إلى صفحة سجلات الغياب
    navigate('/absences');
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-blue-800">
            {editingId ? "تعديل سجل الغياب" : "تسجيل غياب جديد"}
          </h1>
          <button 
            onClick={() => navigate('/absences')}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            العودة إلى سجلات الغياب
          </button>
        </div>
        
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {editingId ? "تم تعديل سجل الغياب بنجاح" : "تم تسجيل الغياب بنجاح"}
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center mb-4">
            <label className="inline-flex items-center mr-6">
              <input
                type="radio"
                checked={!useManualId}
                onChange={() => setUseManualId(false)}
                className="form-radio h-5 w-5 text-blue-600"
              />
              <span className="mr-2">اختيار من القائمة</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                checked={useManualId}
                onChange={() => setUseManualId(true)}
                className="form-radio h-5 w-5 text-blue-600"
              />
              <span className="mr-2">إدخال معرف التلميذ يدويًا</span>
            </label>
          </div>
          
          {useManualId ? (
            <div>
              <label className="block text-gray-700 font-semibold mb-2">معرف التلميذ</label>
              <input 
                type="text" 
                value={manualStudentId}
                onChange={handleManualIdChange}
                placeholder="أدخل معرف التلميذ"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          ) : (
            <div>
              <label className="block text-gray-700 font-semibold mb-2">اختر الطالب</label>
              <select 
                value={selectedStudent}
                onChange={handleStudentChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">-- اختر الطالب --</option>
                {students.map(student => (
                  <option key={student.id} value={student.id}>
                    {student.fullName} - {student.uid || student.id}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          <div>
            <label className="block text-gray-700 font-semibold mb-2">وقت الغياب</label>
            <input 
              type="time" 
              name="time"
              value={absenceData.time}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-700 font-semibold mb-2">يوم الغياب</label>
            <select 
              name="day"
              value={absenceData.day}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">-- اختر اليوم --</option>
              <option value="السبت">السبت</option>
              <option value="الأحد">الأحد</option>
              <option value="الاثنين">الاثنين</option>
              <option value="الثلاثاء">الثلاثاء</option>
              <option value="الأربعاء">الأربعاء</option>
              <option value="الخميس">الخميس</option>
              <option value="الجمعة">الجمعة</option>
            </select>
          </div>
          
          <div>
            <label className="block text-gray-700 font-semibold mb-2">سبب الغياب</label>
            <input 
              type="text" 
              name="reason"
              value={absenceData.reason}
              onChange={handleChange}
              placeholder="أدخل سبب الغياب"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div className="flex space-x-4 space-x-reverse">
            <button 
              type="submit"
              disabled={loading}
              className={`flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-bold text-lg hover:bg-blue-700 transition-all ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? 'جاري المعالجة...' : (editingId ? 'تحديث سجل الغياب' : 'تسجيل الغياب')}
            </button>
            
            {editingId && (
              <button 
                type="button"
                onClick={cancelEdit}
                className="flex-1 bg-gray-300 text-gray-800 py-3 px-6 rounded-lg font-bold text-lg hover:bg-gray-400 transition-all"
              >
                إلغاء التعديل
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
