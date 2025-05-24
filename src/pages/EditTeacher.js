import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { fetchYears, fetchBranches, fetchSections } from "../firebase/school/schoolService";

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

  // إضافة حالات للبيانات المجلوبة من قاعدة البيانات
  const [yearsData, setYearsData] = useState([]);
  const [branchesData, setBranchesData] = useState({});
  const [sectionsData, setSectionsData] = useState({});
  const [dataLoading, setDataLoading] = useState(false);
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
          
          // حفظ معرف المدرسة في التخزين المحلي للاستخدام المستقبلي
          if (teacherData.schoolId) {
            localStorage.setItem('schoolId', teacherData.schoolId);
          }
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

  // جلب السنوات الدراسية عند تغيير معرف المدرسة
  useEffect(() => {
    const getYears = async () => {
      if (teacher.schoolId) {
        setDataLoading(true);
        try {
          const years = await fetchYears(teacher.schoolId);
          setYearsData(years);
          
          // جلب الشعب والأقسام لكل سنة دراسية
          const branchesObj = {};
          const sectionsObj = {};
          
          for (const year of years) {
            // جلب الشعب لكل سنة
            const branches = await fetchBranches(teacher.schoolId, year.id);
            branchesObj[year.id] = branches;
            
            // جلب الأقسام لكل شعبة
            sectionsObj[year.id] = {};
            for (const branch of branches) {
              const sections = await fetchSections(teacher.schoolId, year.id, branch.id);
              sectionsObj[year.id][branch.id] = sections;
            }
          }
          
          setBranchesData(branchesObj);
          setSectionsData(sectionsObj);
        } catch (error) {
          console.error("خطأ في جلب البيانات:", error);
        } finally {
          setDataLoading(false);
        }
      }
    };

    getYears();
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

  if (loading || dataLoading) {
    return <div className="text-center p-6">جاري تحميل البيانات...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-gradient-to-r from-blue-400 to-blue-500 p-6 rounded-t-lg shadow-lg">
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
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
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
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
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
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
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
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>

        <div className="bg-sky-50 p-6 rounded-lg border border-blue-200">
          <h3 className="font-bold text-lg mb-4 text-sky-800">اختر الأقسام التي يدرّس فيها:</h3>
          
          {yearsData.length === 0 ? (
            <div className="text-center p-4 text-gray-500">
              لا توجد بيانات متاحة. يرجى التأكد من إدخال معرف المدرسة الصحيح.
            </div>
          ) : (
            <div className="overflow-x-auto">
              {yearsData.map(year => {
                const yearBranches = branchesData[year.id] || [];
                
                return yearBranches.length > 0 ? (
                  <div key={year.id} className="mb-6">
                    <h4 className="font-semibold text-blue-800 mb-2">السنة: {year.name || year.id}</h4>
                    
                    {yearBranches.map(branch => {
                      const branchSections = sectionsData[year.id]?.[branch.id] || [];
                      
                      return branchSections.length > 0 ? (
                        <div key={`${year.id}-${branch.id}`} className="mb-4 border border-blue-100 rounded-lg overflow-hidden">
                          <div className="bg-blue-50 p-2 font-medium">
                            الشعبة: {branch.name || branch.id}
                          </div>
                          
                          <table className="min-w-full border-collapse">
                            <thead>
                              <tr className="bg-blue-100">
                                <th className="border border-gray-300 p-2 text-blue-800 w-1/3">القسم</th>
                                <th className="border border-gray-300 p-2 text-blue-800 w-2/3">تدريس</th>
                              </tr>
                            </thead>
                            <tbody>
                              {branchSections.map(section => {
                                const selected = selectedAssignments.find(
                                  a => a.year === year.id && a.branch === branch.id && a.section === section.id
                                );
                                
                                return (
                                  <tr key={`${year.id}-${branch.id}-${section.id}`}>
                                    <td className="border border-gray-300 p-2 font-medium">
                                      {section.name || section.id}
                                    </td>
                                    <td className="border border-gray-300 p-2 text-center">
                                      <input
                                        type="checkbox"
                                        checked={!!selected}
                                        onChange={() => toggleAssignment({ 
                                          year: year.id, 
                                          branch: branch.id, 
                                          section: section.id,
                                          yearName: year.name || year.id,
                                          branchName: branch.name || branch.id,
                                          sectionName: section.name || section.id
                                        })}
                                        className="w-5 h-5 cursor-pointer accent-blue-600"
                                      />
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      ) : null;
                    })}
                  </div>
                ) : null;
              })}
            </div>
          )}
        </div>

        <div className="flex space-x-4 space-x-reverse">
          <button 
            type="submit" 
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-lg font-bold text-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md flex items-center justify-center"
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