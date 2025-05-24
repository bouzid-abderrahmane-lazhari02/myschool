import { useState, useEffect } from "react";
import { addTeacherToFirestore } from "../firebase/teacher/teacherService";
import { fetchAllSchoolData } from "../firebase/school/schoolService";

function AddTeacherForm() {
  const [teacher, setTeacher] = useState({
    uid: "",
    name: "",
    subject: "",
    password: "", // إضافة حقل كلمة المرور
    schoolId: localStorage.getItem('schoolId') || "",
    assignedSections: [],
  });

  const [selectedAssignments, setSelectedAssignments] = useState([]);
  const [schoolData, setSchoolData] = useState({ years: [] });
  const [loading, setLoading] = useState(false);

  // جلب بيانات المدرسة عند تغيير معرف المدرسة
  useEffect(() => {
    const fetchData = async () => {
      if (teacher.schoolId) {
        setLoading(true);
        try {
          const data = await fetchAllSchoolData(teacher.schoolId);
          setSchoolData(data);
        } catch (error) {
          console.error("خطأ في جلب بيانات المدرسة:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [teacher.schoolId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTeacher({ ...teacher, [name]: value });
    
    // حفظ معرف المدرسة في التخزين المحلي للاستخدام المستقبلي
    if (name === 'schoolId') {
      localStorage.setItem('schoolId', value);
    }
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
    await addTeacherToFirestore({ ...teacher, assignedSections: selectedAssignments });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-t-lg shadow-lg">
        <h2 className="text-2xl font-bold text-white text-center">إضافة أستاذ جديد</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 bg-white shadow-lg rounded-b-lg space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">معرف الأستاذ</label>
            <input
              type="text"
              name="uid"
              placeholder="أدخل معرف الأستاذ"
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 font-semibold mb-2">الاسم الكامل</label>
            <input
              type="text"
              name="name"
              placeholder="أدخل الاسم الكامل"
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 font-semibold mb-2">المادة التي يدرسها</label>
            <input
              type="text"
              name="subject"
              placeholder="أدخل المادة التي يدرسها"
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 font-semibold mb-2">كلمة المرور</label>
            <input
              type="password"
              name="password"
              placeholder="أدخل كلمة المرور"
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 font-semibold mb-2">معرف المدرسة</label>
            <input
              type="text"
              name="schoolId"
              value={teacher.schoolId}
              placeholder="أدخل معرف المدرسة"
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-4">جاري تحميل بيانات المدرسة...</div>
        ) : schoolData.years.length > 0 ? (
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h3 className="font-bold text-lg mb-4 text-blue-800">اختر الأقسام التي يدرّس فيها:</h3>
            
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-blue-100">
                    <th className="border border-gray-300 p-2 text-blue-800">السنة / الشعبة</th>
                    {schoolData.years.flatMap(year => 
                      year.branches.flatMap(branch => 
                        branch.sections.map(section => (
                          <th key={`${year.id}-${branch.id}-${section.id}`} className="border border-gray-300 p-2 text-blue-800">
                            {section.name || section.id}
                          </th>
                        ))
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {schoolData.years.map(year => (
                    year.branches.map(branch => (
                      <tr key={`${year.id}-${branch.id}`}>
                        <td className="border border-gray-300 p-2 font-medium bg-blue-50">
                          السنة {year.name || year.id} / الشعبة {branch.name || branch.id}
                        </td>
                        {branch.sections.map(section => {
                          const selected = selectedAssignments.find(
                            a => a.year === year.id && a.branch === branch.id && a.section === section.id
                          );
                          return (
                            <td key={`${year.id}-${branch.id}-${section.id}`} className="border border-gray-300 p-2 text-center">
                              <input
                                type="checkbox"
                                checked={!!selected}
                                onChange={() => toggleAssignment({ year: year.id, branch: branch.id, section: section.id })}
                                className="w-5 h-5 cursor-pointer accent-blue-600"
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
        ) : teacher.schoolId ? (
          <div className="text-center py-4 text-amber-600">
            لم يتم العثور على بيانات للمدرسة. تأكد من إدخال معرف المدرسة الصحيح أو إضافة بيانات المدرسة أولاً.
          </div>
        ) : (
          <div className="text-center py-4 text-blue-600">
            أدخل معرف المدرسة لعرض الشعب والأقسام المتاحة.
          </div>
        )}

        <button 
          type="submit" 
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-lg font-bold text-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          إضافة الأستاذ
        </button>
      </form>
    </div>
  );
}

export default AddTeacherForm;
