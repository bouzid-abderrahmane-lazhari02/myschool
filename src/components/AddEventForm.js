import React, { useState, useEffect } from 'react';
import { addDoc, collection, doc, setDoc, updateDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function AddEventForm() {
  const [isEditing, setIsEditing] = useState(false);
  const [eventId, setEventId] = useState(null);
  const navigate = useNavigate();
  
  // حالة الفعالية
  const [event, setEvent] = useState({
    title: '',
    date: '',
    time: '',
    type: 'faliat',
    target: 'all', // القيمة الافتراضية هي "للجميع"
    targets: [], // مصفوفة فارغة للأهداف المخصصة
    schoolId: localStorage.getItem('schoolId') || '' // استخراج معرف المدرسة من التخزين المحلي كقيمة افتراضية
  });

  // حالة الأقسام المستهدفة
  const [targetSection, setTargetSection] = useState({
    year: '',
    branch: '',
    section: ''
  });

  // إضافة حالات للبيانات المجلوبة من قاعدة البيانات
  const [yearsData, setYearsData] = useState([]);
  const [branchesData, setBranchesData] = useState([]);
  const [sectionsData, setSectionsData] = useState([]);
  const [loading, setLoading] = useState(false);

  // حالة عرض حقول الأقسام المستهدفة
  const [showTargetFields, setShowTargetFields] = useState(false);

  // جلب السنوات الدراسية عند تحميل الصفحة أو تغيير معرف المدرسة
  useEffect(() => {
    const fetchYears = async () => {
      if (event.schoolId) {
        setLoading(true);
        try {
          const yearsQuery = query(collection(db, "school", event.schoolId, "years"));
          const yearsSnapshot = await getDocs(yearsQuery);
          const yearsData = yearsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setYearsData(yearsData);
        } catch (error) {
          console.error("خطأ في جلب السنوات الدراسية:", error);
          toast.error("حدث خطأ أثناء جلب السنوات الدراسية");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchYears();
  }, [event.schoolId]);

  // جلب الشعب عند تغيير السنة الدراسية
  useEffect(() => {
    const fetchBranches = async () => {
      if (event.schoolId && targetSection.year) {
        setLoading(true);
        try {
          const branchesQuery = query(collection(db, "school", event.schoolId, "years", targetSection.year, "branches"));
          const branchesSnapshot = await getDocs(branchesQuery);
          const branchesData = branchesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setBranchesData(branchesData);
        } catch (error) {
          console.error("خطأ في جلب الشعب:", error);
          toast.error("حدث خطأ أثناء جلب الشعب");
        } finally {
          setLoading(false);
        }
      } else {
        setBranchesData([]);
      }
    };

    fetchBranches();
  }, [event.schoolId, targetSection.year]);

  // جلب الأقسام عند تغيير الشعبة
  useEffect(() => {
    const fetchSections = async () => {
      if (event.schoolId && targetSection.year && targetSection.branch) {
        setLoading(true);
        try {
          const sectionsQuery = query(collection(db, "school", event.schoolId, "years", targetSection.year, "branches", targetSection.branch, "sectoins"));
          const sectionsSnapshot = await getDocs(sectionsQuery);
          const sectionsData = sectionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setSectionsData(sectionsData);
        } catch (error) {
          console.error("خطأ في جلب الأقسام:", error);
          toast.error("حدث خطأ أثناء جلب الأقسام");
        } finally {
          setLoading(false);
        }
      } else {
        setSectionsData([]);
      }
    };

    fetchSections();
  }, [event.schoolId, targetSection.year, targetSection.branch]);

  // التحقق مما إذا كان هناك بيانات فعالية للتعديل
  useEffect(() => {
    // التحقق مما إذا كان هناك بيانات فعالية للتعديل
    const editEventData = localStorage.getItem('editEvent');
    if (editEventData) {
      const parsedData = JSON.parse(editEventData);
      setEvent(parsedData);
      setEventId(parsedData.id);
      setIsEditing(true);
      
      // تحديد ما إذا كان يجب عرض حقول الأقسام المستهدفة
      if (parsedData.target === 'custom') {
        setShowTargetFields(true);
      }
      
      // حذف البيانات من التخزين المحلي بعد استخدامها
      localStorage.removeItem('editEvent');
    }
  }, []);

  // دالة لتغيير قيم الفعالية
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'target') {
      setShowTargetFields(value === 'custom');
      
      // إذا تم تغيير الهدف إلى "للجميع"، قم بإعادة تعيين مصفوفة الأهداف
      if (value === 'all') {
        setEvent(prev => ({ ...prev, [name]: value, targets: [] }));
      } else {
        setEvent(prev => ({ ...prev, [name]: value }));
      }
    } else {
      setEvent(prev => ({ ...prev, [name]: value }));
    }
  };

  // دالة لتغيير قيم القسم المستهدف
  const handleTargetSectionChange = (e) => {
    const { name, value } = e.target;
    setTargetSection(prev => ({ ...prev, [name]: value }));
  };

  // دالة لإضافة قسم مستهدف
  const addTargetSection = () => {
    // التحقق من إدخال جميع البيانات المطلوبة
    if (!targetSection.year || !targetSection.branch || !targetSection.section) {
      alert('يرجى إدخال جميع بيانات القسم المستهدف');
      return;
    }
    
    // إنشاء كائن القسم المستهدف
    const newTarget = {
      year: targetSection.year,
      branch: targetSection.branch,
      sections: [targetSection.section]
    };
    
    // إضافة القسم المستهدف إلى مصفوفة الأهداف
    setEvent(prev => ({
      ...prev,
      targets: [...prev.targets, newTarget]
    }));
    
    // إعادة تعيين حقول القسم المستهدف
    setTargetSection({
      year: '',
      branch: '',
      sections: ''
    });
  };

  // دالة لحذف قسم مستهدف
  const removeTargetSection = (index) => {
    setEvent(prev => ({
      ...prev,
      targets: prev.targets.filter((_, i) => i !== index)
    }));
  };

  // دالة لتحويل التاريخ والوقت إلى طابع زمني
  const convertToTimestamp = (dateString, timeString) => {
    if (!dateString || !timeString) return null;
    
    const [year, month, day] = dateString.split('-');
    const [hours, minutes] = timeString.split(':');
    
    // إنشاء كائن تاريخ جديد (الشهر في JavaScript يبدأ من 0)
    const date = new Date(year, month - 1, day, hours, minutes);
    
    return date;
  };

  // استخراج معرف المدرسة من التخزين المحلي أو استخدام قيمة افتراضية
  const schoolId = localStorage.getItem('schoolId') || "defaultSchool";
  
  // دالة لإرسال النموذج
  const handleSubmit = async (e) => {
    e.preventDefault();
 
    try {
      // التحقق من إدخال معرف المدرسة
      if (!event.schoolId) {
        toast.error("يرجى إدخال معرف المدرسة");
        return;
      }
      
      // إنشاء كائن البيانات
      const eventData = {
        title: event.title,
        type: event.type,
        date: event.date ? new Date(event.date) : null,
        time: event.time,
        target: event.target,
        targets: event.targets,
        schoolId: event.schoolId, // إضافة معرف المدرسة
        updatedAt: new Date(), // إضافة تاريخ التحديث
      };
      
      if (isEditing && eventId) {
        // تحديث الفعالية الموجودة
        const eventRef = doc(db, "school", event.schoolId, "events", eventId);
        await updateDoc(eventRef, eventData);
        toast.success("تم تحديث الفعالية بنجاح");
      } else {
        // إضافة فعالية جديدة
        const eventRef = doc(collection(db, "school", event.schoolId, "events"));
        // إضافة معرف الفعالية والتاريخ للفعاليات الجديدة
        eventData.id = eventRef.id;
        eventData.createdAt = new Date();
        await setDoc(eventRef, eventData);
        toast.success("تمت إضافة الفعالية بنجاح");
      }
      
      // حفظ معرف المدرسة في التخزين المحلي للاستخدام المستقبلي
      localStorage.setItem('schoolId', event.schoolId);
      
      // إعادة تعيين النموذج
      setEvent({
        title: '',
        date: '',
        time: '',
        type: 'faliat',
        target: 'all',
        targets: [],
        schoolId: event.schoolId // الاحتفاظ بمعرف المدرسة للاستخدام المستقبلي
      });
      
      // العودة إلى صفحة الفعاليات
      navigate('/events');
    } catch (error) {
      console.error(isEditing ? "خطأ في تحديث الفعالية:" : "خطأ في إضافة الفعالية:", error);
      toast.error(isEditing ? "حدث خطأ أثناء تحديث الفعالية" : "حدث خطأ أثناء إضافة الفعالية");
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="bg-gradient-to-r from-blue-400 to-blue-500 p-6 rounded-t-lg shadow-lg">
        <h2 className="text-2xl font-bold text-white text-center">
          {isEditing ? "تعديل الفعالية" : "إضافة فعالية جديدة"}
        </h2>
      </div>
      
      <form onSubmit={handleSubmit} className="bg-white rounded-b-lg shadow-lg p-6 border-t-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">عنوان الفعالية</label>
            <input 
              type="text" 
              name="title" 
              placeholder="أدخل عنوان الفعالية" 
              value={event.title}
              onChange={handleChange} 
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all" 
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-700 font-semibold mb-2">معرف المدرسة</label>
            <input 
              type="text" 
              name="schoolId" 
              placeholder="أدخل معرف المدرسة" 
              value={event.schoolId}
              onChange={handleChange} 
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all" 
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-700 font-semibold mb-2">نوع الفعالية</label>
            <select 
              name="type" 
              value={event.type}
              onChange={handleChange} 
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all appearance-none bg-white"
              required
            >
              <option value="faliat">فعالية</option>
              <option value="antiro">فرض</option>
              <option value="faliat">نشاط</option>
            </select>
          </div>
          
          <div>
            <label className="block text-gray-700 font-semibold mb-2">تاريخ الفعالية</label>
            <input 
              type="date" 
              name="date" 
              value={event.date}
              onChange={handleChange} 
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all" 
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-700 font-semibold mb-2">وقت الفعالية</label>
            <input 
              type="time" 
              name="time" 
              value={event.time}
              onChange={handleChange} 
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all" 
              required
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-gray-700 font-semibold mb-2">الفئة المستهدفة</label>
            <select 
              name="target" 
              value={event.targets}
              onChange={handleChange} 
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all appearance-none bg-white"
              required
            >
              <option value="all">للجميع</option>
              <option value="custom">تخصيص</option>
            </select>
          </div>
        </div>
        
        {showTargetFields && (
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-6">
            <h3 className="font-bold text-lg mb-4">تحديد الأقسام المستهدفة</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">السنة</label>
                <select 
                  name="year" 
                  value={targetSection.year}
                  onChange={handleTargetSectionChange} 
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                  disabled={loading || yearsData.length === 0}
                >
                  <option value="">اختر السنة</option>
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
                  name="branch" 
                  value={targetSection.branch}
                  onChange={handleTargetSectionChange} 
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                  disabled={loading || branchesData.length === 0 || !targetSection.year}
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
                <label className="block text-gray-700 font-semibold mb-2">القسم</label>
                <select 
                  name="section" 
                  value={targetSection.section}
                  onChange={handleTargetSectionChange} 
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                  disabled={loading || sectionsData.length === 0 || !targetSection.branch}
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
              type="button" 
              onClick={addTargetSection}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all"
              disabled={!targetSection.year || !targetSection.branch || !targetSection.section}
            >
              إضافة قسم
            </button>
            
            {event.targets.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold mb-2">الأقسام المضافة:</h4>
                <ul className="space-y-2">
                  {event.targets.map((targets, index) => (
                    <li key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                      <span>
                        السنة: {targets.year} | الشعبة: {targets.branch} | القسم: {targets.sections.join(', ')}
                      </span>
                      <button 
                        type="button" 
                        onClick={() => removeTargetSection(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        حذف
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        
        <div className="flex space-x-4 space-x-reverse">
          <button 
            type="submit" 
            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-lg font-bold text-lg hover:from-sky-600 hover:to-sky-700 transition-all shadow-md flex items-center justify-center"
          >
            {isEditing ? "حفظ التعديلات" : "إضافة الفعالية"}
          </button>
          
          <button 
            type="button" 
            className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-bold text-lg hover:bg-gray-300 transition-all shadow-md flex items-center justify-center"
            onClick={() => navigate('/events')}
          >
            إلغاء
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddEventForm;
