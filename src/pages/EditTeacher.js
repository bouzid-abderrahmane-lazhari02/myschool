import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

const years = ["1", "2", "3"];
const branches = ["SE", "SM"];
const sections = ["1a", "2a", "3a", "1b", "2b"];

function EditTeacher() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [teacher, setTeacher] = useState({
    uid: "",
    name: "",
    subject: "",
    schoolId: "",
    assignedSections: [],
  });

  const [selectedAssignments, setSelectedAssignments] = useState([]);

  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        setLoading(true);
        const teacherDoc = await getDoc(doc(db, "teachers", id));
        
        if (teacherDoc.exists()) {
          const teacherData = teacherDoc.data();
          setTeacher(teacherData);
          setSelectedAssignments(teacherData.assignedSections || []);
        } else {
          alert("لم يتم العثور على بيانات المعلم!");
          navigate("/teachers");
        }
      } catch (error) {
        console.error("خطأ في جلب بيانات المعلم:", error);
        alert("حدث خطأ أثناء محاولة جلب بيانات المعلم");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTeacher();
    }
  }, [id, navigate]);

  const handleChange = (e) => {
    setTeacher({ ...teacher, [e.target.name]: e.target.value });
  };

  const toggleAssignment = (assignment) => {
    setSelectedAssignments((prev) => {
      const exists = prev.find(
        (a) =>
          a.year === assignment.year &&
          a.branch === assignment.branch &&
          a.section === assignment.section
      );
      if (exists) {
        return prev.filter(
          (a) =>
            !(
              a.year === assignment.year &&
              a.branch === assignment.branch &&
              a.section === assignment.section
            )
        );
      } else {
        return [...prev, assignment];
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const teacherRef = doc(db, "teachers", id);
      await updateDoc(teacherRef, {
        ...teacher,
        assignedSections: selectedAssignments,
      });
      
      alert("تم تحديث بيانات المعلم بنجاح");
      navigate("/teachers");
    } catch (error) {
      console.error("خطأ في تحديث بيانات المعلم:", error);
      alert("حدث خطأ أثناء محاولة تحديث بيانات المعلم");
    }
  };

  if (loading) {
    return <div className="text-center p-6">جاري تحميل البيانات...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-gradient-to-r from-sky-400 to-sky-500 p-6 rounded-t-lg shadow-lg">
        <h2 className="text-2xl font-bold text-white text-center">تعديل بيانات الأستاذ</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 bg-white shadow-lg rounded-b-lg space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">معرف الأستاذ</label>
            <input
              type="text"
              name="uid"
              placeholder="أدخل معرف الأستاذ"
              value={teacher.uid || ""}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 font-semibold mb-2">الاسم الكامل</label>
            <input
              type="text"
              name="name"
              placeholder="أدخل الاسم الكامل"
              value={teacher.name || ""}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 font-semibold mb-2">المادة التي يدرسها</label>
            <input
              type="text"
              name="subject"
              placeholder="أدخل المادة التي يدرسها"
              value={teacher.subject || ""}
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
              value={teacher.schoolId || ""}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
            />
          </div>
        </div>

        <div className="bg-sky-50 p-6 rounded-lg border border-sky-200">
          <h3 className="font-bold text-lg mb-4 text-sky-800">اختر الأقسام التي يدرّس فيها:</h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-green-100">
                  <th className="border border-gray-300 p-2 text-green-800">السنة / الشعبة</th>
                  {sections.map(section => (
                    <th key={section} className="border border-gray-300 p-2 text-green-800">
                      القسم {section}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {years.map(year => (
                  branches.map(branch => (
                    <tr key={`${year}-${branch}`}>
                      <td className="border border-gray-300 p-2 font-medium bg-green-50">
                        السنة {year} / الشعبة {branch}
                      </td>
                      {sections.map(section => {
                        const selected = selectedAssignments.find(
                          a => a.year === year && a.branch === branch && a.section === section
                        );
                        return (
                          <td key={`${year}-${branch}-${section}`} className="border border-gray-300 p-2 text-center">
                            <input
                              type="checkbox"
                              checked={!!selected}
                              onChange={() => toggleAssignment({ year, branch, section })}
                              className="w-5 h-5 cursor-pointer accent-green-600"
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex space-x-4 space-x-reverse">
          <button 
            type="submit" 
            className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-6 rounded-lg font-bold text-lg hover:from-green-700 hover:to-green-800 transition-all shadow-md flex items-center justify-center"
          >
            حفظ التغييرات
          </button>
          
          <button 
            type="button" 
            className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-bold text-lg hover:bg-gray-300 transition-all shadow-md flex items-center justify-center"
            onClick={() => navigate('/teachers')}
          >
            إلغاء
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditTeacher;