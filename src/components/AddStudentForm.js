import { useState, useEffect } from "react";
import { addStudentToFirestore } from "../firebase/student/studentService";
import { fetchYears, fetchBranches, fetchSections } from "../firebase/school/schoolService";

function AddStudentForm() {
  const [student, setStudent] = useState({
    uid: "",
    fullName: "",
    password: "",
    years: "",
    branches: "",
    section: "",
    schoolId: localStorage.getItem('schoolId') || "",
    user: "student",
    birthPlace: "", // إضافة مكان الميلاد
    birthDate: "", // إضافة تاريخ الميلاد
  });
  
  const [yearsData, setYearsData] = useState([]);
  const [branchesData, setBranchesData] = useState([]);
  const [sectionsData, setSectionsData] = useState([]);
  const [loading, setLoading] = useState(false);

  // جلب السنوات الدراسية عند تغيير معرف المدرسة
  useEffect(() => {
    const getYears = async () => {
      if (student.schoolId) {
        setLoading(true);
        try {
          const years = await fetchYears(student.schoolId);
          setYearsData(years);
        } catch (error) {
          console.error("خطأ في جلب السنوات الدراسية:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    getYears();
  }, [student.schoolId]);

  // جلب الشعب عند تغيير السنة الدراسية
  useEffect(() => {
    const getBranches = async () => {
      if (student.schoolId && student.years) {
        setLoading(true);
        try {
          const branches = await fetchBranches(student.schoolId, student.years);
          setBranchesData(branches);
        } catch (error) {
          console.error("خطأ في جلب الشعب:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setBranchesData([]);
      }
    };

    getBranches();
  }, [student.schoolId, student.years]);

  // جلب الأقسام عند تغيير الشعبة
  useEffect(() => {
    const getSections = async () => {
      if (student.schoolId && student.years && student.branches) {
        setLoading(true);
        try {
          const sections = await fetchSections(student.schoolId, student.years, student.branches);
          setSectionsData(sections);
        } catch (error) {
          console.error("خطأ في جلب الأقسام:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setSectionsData([]);
      }
    };

    getSections();
  }, [student.schoolId, student.years, student.branches]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStudent({ ...student, [name]: value });
    
    // حفظ معرف المدرسة في التخزين المحلي للاستخدام المستقبلي
    if (name === 'schoolId') {
      localStorage.setItem('schoolId', value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addStudentToFirestore(student);
      // توجيه المستخدم إلى صفحة التلاميذ بعد الإضافة
      window.location.href = "/students";
    } catch (error) {
      console.error("خطأ في إضافة التلميذ:", error);
      alert("حدث خطأ أثناء إضافة التلميذ");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-t-lg shadow-lg">
        <h2 className="text-2xl font-bold text-white text-center">إضافة تلميذ جديد</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="bg-white rounded-b-lg shadow-lg p-6 border-t-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">معرف التلميذ</label>
            <input 
              type="text" 
              name="uid" 
              placeholder="أدخل معرف التلميذ" 
              onChange={handleChange} 
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
            />
          </div>
          
          <div>
            <label className="block text-gray-700 font-semibold mb-2">الاسم الكامل</label>
            <input 
              type="text" 
              name="fullName" 
              placeholder="أدخل الاسم الكامل" 
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
              value={student.schoolId}
              placeholder="أدخل معرف المدرسة" 
              onChange={handleChange} 
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
            />
          </div>
          
          <div>
            <label className="block text-gray-700 font-semibold mb-2">السنة الدراسية</label>
            <select 
              name="years" 
              value={student.years}
              onChange={handleChange} 
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none bg-white"
              disabled={loading || yearsData.length === 0}
            >
              <option value="">اختر السنة الدراسية</option>
              {yearsData.map(year => (
                <option key={year.id} value={year.id}>
                  {year.name || year.id}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-gray-700 font-semibold mb-2">الشعبة</label>
            <select 
              name="branches" 
              value={student.branches}
              onChange={handleChange} 
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none bg-white"
              disabled={loading || branchesData.length === 0}
            >
              <option value="">اختر الشعبة</option>
              {branchesData.map(branch => (
                <option key={branch.id} value={branch.id}>
                  {branch.name || branch.id}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-gray-700 font-semibold mb-2">مكان الميلاد</label>
            <input 
              type="text" 
              name="birthPlace" 
              placeholder="أدخل مكان الميلاد" 
              value={student.birthPlace}
              onChange={handleChange} 
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
            />
          </div>
          
          <div>
            <label className="block text-gray-700 font-semibold mb-2">تاريخ الميلاد</label>
            <input 
              type="date" 
              name="birthDate" 
              value={student.birthDate}
              onChange={handleChange} 
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-gray-700 font-semibold mb-2">القسم</label>
            <select 
              name="section" 
              value={student.section}
              onChange={handleChange} 
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none bg-white"
              disabled={loading || sectionsData.length === 0}
            >
              <option value="">اختر القسم</option>
              {sectionsData.map(section => (
                <option key={section.id} value={section.id}>
                  {section.name || section.id}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <button 
          type="submit" 
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-lg font-bold text-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md flex items-center justify-center"
          disabled={loading}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          إضافة التلميذ
        </button>
      </form>
    </div>
  );
}

export default AddStudentForm;
