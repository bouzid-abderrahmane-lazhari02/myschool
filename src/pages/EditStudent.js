import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function EditStudent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState({
    fullName: "",
    uid: "",
    years: "",
    branches: "",
    section: "",
    birthPlace: "", // إضافة مكان الميلاد
    birthDate: "", // إضافة تاريخ الميلاد
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const docRef = doc(db, "students", id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setStudent({ ...docSnap.data() });
        } else {
          alert("لم يتم العثور على التلميذ!");
          navigate("/students");
        }
      } catch (error) {
        console.error("خطأ في جلب بيانات التلميذ:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStudent((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const docRef = doc(db, "students", id);
      await updateDoc(docRef, student);
      alert("تم تحديث بيانات التلميذ بنجاح");
      navigate("/students");
    } catch (error) {
      console.error("خطأ في تحديث بيانات التلميذ:", error);
      alert("حدث خطأ أثناء تحديث بيانات التلميذ");
    }
  };

  if (loading) {
    return <div className="flex-1 p-6 flex items-center justify-center">جاري التحميل...</div>;
  }

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-blue-800 mb-8">تعديل بيانات التلميذ</h1>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 mb-2">الاسم الكامل</label>
              <input
                type="text"
                name="fullName"
                value={student.fullName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">معرف التلميذ</label>
              <input
                type="text"
                name="uid"
                value={student.uid}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">السنة</label>
              <input
                type="text"
                name="years"
                value={student.years}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">الشعبة</label>
              <input
                type="text"
                name="branches"
                value={student.branches}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">القسم</label>
              <input
                type="text"
                name="section"
                value={student.section}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>
            
            {/* إضافة حقل مكان الميلاد */}
            <div>
              <label className="block text-gray-700 mb-2">مكان الميلاد</label>
              <input
                type="text"
                name="birthPlace"
                value={student.birthPlace || ""}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>
            
            {/* إضافة حقل تاريخ الميلاد */}
            <div>
              <label className="block text-gray-700 mb-2">تاريخ الميلاد</label>
              <input
                type="date"
                name="birthDate"
                value={student.birthDate || ""}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>
          </div>
          
          <div className="mt-8 flex justify-end">
            <button
              type="button"
              onClick={() => navigate("/students")}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors ml-4"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              حفظ التغييرات
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}