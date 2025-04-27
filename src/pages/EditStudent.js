import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

function EditStudent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState({
    uid: "",
    fullName: "",
    password: "",
    schoolId: "",
    years: "",
    branches: "",
    section: ""
  });

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        setLoading(true);
        const studentDoc = await getDoc(doc(db, "students", id));
        
        if (studentDoc.exists()) {
          const studentData = studentDoc.data();
          setStudent(studentData);
        } else {
          alert("لم يتم العثور على بيانات التلميذ!");
          navigate("/students");
        }
      } catch (error) {
        console.error("خطأ في جلب بيانات التلميذ:", error);
        alert("حدث خطأ أثناء محاولة جلب بيانات التلميذ");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchStudent();
    }
  }, [id, navigate]);

  const handleChange = (e) => {
    setStudent({ ...student, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const studentRef = doc(db, "students", id);
      await updateDoc(studentRef, student);
      
      alert("تم تحديث بيانات التلميذ بنجاح");
      navigate("/students");
    } catch (error) {
      console.error("خطأ في تحديث بيانات التلميذ:", error);
      alert("حدث خطأ أثناء محاولة تحديث بيانات التلميذ");
    }
  };

  if (loading) {
    return <div className="text-center p-6">جاري تحميل البيانات...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-gradient-to-r from-sky-400 to-sky-500 p-6 rounded-t-lg shadow-lg">
        <h2 className="text-2xl font-bold text-white text-center">تعديل بيانات التلميذ</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="bg-white rounded-b-lg shadow-lg p-6 border-t-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">معرف التلميذ</label>
            <input 
              type="text" 
              name="uid" 
              placeholder="أدخل معرف التلميذ" 
              value={student.uid || ""}
              onChange={handleChange} 
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all" 
            />
          </div>
          
          <div>
            <label className="block text-gray-700 font-semibold mb-2">الاسم الكامل</label>
            <input 
              type="text" 
              name="fullName" 
              placeholder="أدخل الاسم الكامل" 
              value={student.fullName || ""}
              onChange={handleChange} 
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all" 
            />
          </div>
          
          <div>
            <label className="block text-gray-700 font-semibold mb-2">كلمة المرور</label>
            <input 
              type="password" 
              name="password" 
              placeholder="أدخل كلمة المرور" 
              value={student.password || ""}
              onChange={handleChange} 
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all" 
            />
          </div>
          
          <div>
            <label className="block text-gray-700 font-semibold mb-2">معرف المدرسة</label>
            <input 
              type="text" 
              name="schoolId" 
              placeholder="أدخل معرف المدرسة" 
              value={student.schoolId || ""}
              onChange={handleChange} 
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all" 
            />
          </div>
          
          <div>
            <label className="block text-gray-700 font-semibold mb-2">السنة الدراسية</label>
            <select 
              name="years" 
              value={student.years || ""}
              onChange={handleChange} 
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all appearance-none bg-white"
            >
              <option value="">اختر السنة الدراسية</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
            </select>
          </div>
          
          <div>
            <label className="block text-gray-700 font-semibold mb-2">الشعبة</label>
            <select 
              name="branches" 
              value={student.branches || ""}
              onChange={handleChange} 
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all appearance-none bg-white"
            >
              <option value="">اختر الشعبة</option>
              <option value="SE">علوم</option>
              <option value="SM">آداب</option>
            </select>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-gray-700 font-semibold mb-2">القسم</label>
            <select 
              name="section" 
              value={student.section || ""}
              onChange={handleChange} 
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all appearance-none bg-white"
            >
              <option value="">اختر القسم</option>
              <option value="1a">1</option>
              <option value="2a">2</option>
              <option value="3a">3</option>
              <option value="1b">4</option>
              <option value="2b">5</option>
            </select>
          </div>
        </div>
        
        <div className="flex space-x-4 space-x-reverse">
          <button 
            type="submit" 
            className="flex-1 bg-gradient-to-r from-sky-500 to-sky-600 text-white py-3 px-6 rounded-lg font-bold text-lg hover:from-sky-600 hover:to-sky-700 transition-all shadow-md flex items-center justify-center"
          >
            حفظ التغييرات
          </button>
          
          <button 
            type="button" 
            className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-bold text-lg hover:bg-gray-300 transition-all shadow-md flex items-center justify-center"
            onClick={() => navigate('/students')}
          >
            إلغاء
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditStudent;