import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, getDoc, deleteDoc, collectionGroup, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function AbsencesPage() {
  const [absences, setAbsences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(""); // إضافة متغير حالة جديد لرسائل النجاح
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllAbsences();
  }, []);

  const fetchAllAbsences = async () => {
    setLoading(true);
    try {
      const absencesSnapshot = await getDocs(collectionGroup(db, "absences"));
      const absencesData = [];
      
      for (const doc of absencesSnapshot.docs) {
        // استخراج معرف الطالب من مسار المستند بشكل أكثر دقة
        const pathSegments = doc.ref.path.split('/');
        // التأكد من أن المسار يحتوي على 'students' في المكان المناسب
        let studentId = "غير معروف";
        const studentsIndex = pathSegments.findIndex(segment => segment === "students");
        
        if (studentsIndex >= 0 && pathSegments.length > studentsIndex + 1) {
          studentId = pathSegments[studentsIndex + 1];
        }
        
        // محاولة الحصول على اسم الطالب
        let studentName = "غير معروف";
        try {
          const studentDoc = await getDoc(doc(db, "students", studentId));
          if (studentDoc.exists()) {
            studentName = studentDoc.data().fullName || "غير معروف";
          }
        } catch (error) {
          console.error("خطأ في جلب بيانات الطالب:", error);
        }
        
        // طباعة معلومات التصحيح
        console.log("معلومات المستند:", {
          path: doc.ref.path,
          segments: pathSegments,
          studentsIndex: studentsIndex,
          extractedStudentId: studentId
        });
        
        absencesData.push({
          id: doc.id,
          studentId: studentId,
          studentName: studentName,
          status: doc.data().status || "pending",
          ...doc.data(),
          // تخزين المسار الكامل للمستند للاستخدام المباشر لاحقاً
          fullPath: doc.ref.path
        });
      }
      
      // ترتيب الغيابات حسب التاريخ (الأحدث أولاً)
      absencesData.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return b.createdAt.toDate() - a.createdAt.toDate();
        }
        return 0;
      });
      
      setAbsences(absencesData);
    } catch (error) {
      console.error("خطأ في جلب بيانات الغيابات:", error);
      setError("حدث خطأ أثناء جلب بيانات الغيابات");
    } finally {
      setLoading(false);
    }
  };

  // إضافة وظيفة لتحديث حالة التبرير (قبول أو رفض)
  const updateAbsenceStatus = async (absence, newStatus) => {
    try {
      // طباعة معلومات التصحيح للتأكد من صحة المعرفات
      console.log("تحديث حالة التبرير - معلومات كاملة:", {
        studentId: absence.studentId,
        absenceId: absence.id,
        newStatus: newStatus,
        absencePath: absence.fullPath || `students/${absence.studentId}/absences/${absence.id}`,
        absenceData: absence
      });
      
      // التحقق من وجود معرف الطالب ومعرف سجل الغياب
      if (!absence.studentId || !absence.id) {
        console.error("معرف الطالب أو معرف سجل الغياب غير موجود");
        setError("حدث خطأ: معرف الطالب أو معرف سجل الغياب غير موجود");
        return;
      }
      
      try {
        let absenceRef;
        
        // استخدام المسار الكامل إذا كان متاحاً
        if (absence.fullPath) {
          absenceRef = doc(db, absence.fullPath);
        } else {
          // استخدام الطريقة التقليدية
          absenceRef = doc(db, "students", absence.studentId, "absences", absence.id);
        }
        
        // التحقق من وجود الوثيقة قبل التحديث
        const absenceDoc = await getDoc(absenceRef);
        if (!absenceDoc.exists()) {
          // محاولة ثانية باستخدام طريقة بديلة للوصول إلى المستند
          console.log("محاولة بديلة للوصول إلى المستند");
          // يمكن أن تكون هناك مشكلة في تنسيق المسار، لذا نحاول طريقة أخرى
          const allAbsencesQuery = await getDocs(collectionGroup(db, "absences"));
          const targetDoc = allAbsencesQuery.docs.find(d => d.id === absence.id);
          
          if (targetDoc) {
            // استخدام المرجع المباشر من النتيجة
            await updateDoc(targetDoc.ref, {
              status: newStatus,
              updatedAt: new Date()
            });
            
            // عرض رسالة نجاح مؤقتة
            setError(""); // مسح أي رسائل خطأ سابقة
            const successMessage = newStatus === "approved" ? "تم قبول التبرير بنجاح" : "تم رفض التبرير بنجاح";
            setSuccess(successMessage);
            setTimeout(() => setSuccess(""), 3000);
            
            // تحديث قائمة الغيابات
            fetchAllAbsences();
            return;
          } else {
            setError("لا يمكن العثور على سجل الغياب المحدد. قد يكون تم حذفه أو تغييره.");
            return;
          }
        }
        
        // تحديث حالة التبرير
        await updateDoc(absenceRef, {
          status: newStatus,
          updatedAt: new Date()
        });
        
        // عرض رسالة نجاح مؤقتة
        setError(""); // مسح أي رسائل خطأ سابقة
        const successMessage = newStatus === "approved" ? "تم قبول التبرير بنجاح" : "تم رفض التبرير بنجاح";
        setSuccess(successMessage);
        setTimeout(() => setSuccess(""), 3000);
        
        // تحديث قائمة الغيابات
        fetchAllAbsences();
      } catch (innerError) {
        console.error("خطأ في الوصول إلى المستند:", innerError);
        setError("حدث خطأ أثناء محاولة الوصول إلى سجل الغياب: " + innerError.message);
      }
    } catch (error) {
      console.error("خطأ في تحديث حالة التبرير:", error);
      setError("حدث خطأ أثناء محاولة تحديث حالة التبرير: " + error.message);
    }
  };

  const handleDelete = async (absence) => {
    if (window.confirm("هل أنت متأكد من رغبتك في حذف هذا السجل؟")) {
      try {
        // استخدام المسار الكامل إذا كان متاحاً
        let absenceRef;
        
        if (absence.fullPath) {
          absenceRef = doc(db, absence.fullPath);
        } else {
          // استخدام الطريقة التقليدية
          absenceRef = doc(db, "students", absence.studentId, "absences", absence.id);
        }
        
        await deleteDoc(absenceRef);
        // تحديث قائمة الغيابات
        fetchAllAbsences();
        // عرض رسالة نجاح مؤقتة
        setError(""); // مسح أي رسائل خطأ سابقة
        setSuccess("تم حذف سجل الغياب بنجاح");
        setTimeout(() => setSuccess(""), 3000);
      } catch (error) {
        console.error("خطأ في حذف سجل الغياب:", error);
        setError("حدث خطأ أثناء محاولة حذف سجل الغياب: " + error.message);
      }
    }
  };

  const navigateToAddAbsence = () => {
    navigate('/attendance');
  };

  // وظيفة لعرض حالة التبرير بشكل مرئي
  const renderStatusBadge = (status) => {
    switch(status) {
      case "approved":
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">مقبول</span>;
      case "rejected":
        return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">مرفوض</span>;
      default:
        return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">معلق</span>;
    }
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-800">سجلات الغياب</h1>
        <button 
          onClick={navigateToAddAbsence}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <span className="mr-2">+</span>
          إضافة غياب جديد
        </button>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : absences.length > 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-4 border-b text-right">اسم الطالب</th>
                  <th className="py-3 px-4 border-b text-right">معرف الطالب</th>
                  <th className="py-3 px-4 border-b text-right">اليوم</th>
                  <th className="py-3 px-4 border-b text-right">الوقت</th>
                  <th className="py-3 px-4 border-b text-right">السبب</th>
                  <th className="py-3 px-4 border-b text-right">الصورة</th>
                  <th className="py-3 px-4 border-b text-right">حالة التبرير</th>
                  <th className="py-3 px-4 border-b text-right">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {absences.map(absence => (
                  <tr key={absence.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 border-b">{absence.studentName}</td>
                    <td className="py-3 px-4 border-b">{absence.studentId}</td>
                    <td className="py-3 px-4 border-b">{absence.day}</td>
                    <td className="py-3 px-4 border-b">{absence.time}</td>
                    <td className="py-3 px-4 border-b">{absence.reason}</td>
                    <td className="py-3 px-4 border-b">
                      {absence.imageUrl ? (
                        <a href={absence.imageUrl} target="_blank" rel="noopener noreferrer">
                          <img 
                            src={absence.imageUrl} 
                            alt="صورة الغياب" 
                            className="h-16 w-16 object-cover rounded-md"
                          />
                        </a>
                      ) : (
                        <span className="text-gray-400">لا توجد صورة</span>
                      )}
                    </td>
                    <td className="py-3 px-4 border-b">
                      {renderStatusBadge(absence.status)}
                    </td>
                    <td className="py-3 px-4 border-b">
                      <div className="flex space-x-2 space-x-reverse">
                        <button 
                          onClick={() => navigate(`/attendance?edit=${absence.id}&studentId=${absence.studentId}&fullPath=${encodeURIComponent(absence.fullPath)}`)}  
                          className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition-colors"
                        >
                          تعديل
                        </button>
                        <button 
                          onClick={() => handleDelete(absence)}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors"
                        >
                          حذف
                        </button>
                        {/* إضافة زري قبول ورفض */}
                        <button 
                          onClick={() => updateAbsenceStatus(absence, "approved")}
                          className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition-colors"
                          disabled={absence.status === "approved"}
                        >
                          قبول
                        </button>
                        <button 
                          onClick={() => updateAbsenceStatus(absence, "rejected")}
                          className="bg-red-400 text-white px-3 py-1 rounded hover:bg-red-500 transition-colors"
                          disabled={absence.status === "rejected"}
                        >
                          رفض
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500 text-lg">لا توجد سجلات غياب</p>
          <button 
            onClick={navigateToAddAbsence}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            إضافة أول سجل غياب
          </button>
        </div>
      )}
    </div>
  );
}