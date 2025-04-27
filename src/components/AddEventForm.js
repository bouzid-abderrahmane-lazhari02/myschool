import React, { useState, useEffect } from 'react';
import { addDoc, collection, getDocs, deleteDoc, doc, query, orderBy, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';

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
    targets: [] // مصفوفة فارغة للأهداف المخصصة
  });

  // حالة الأقسام المستهدفة
  const [targetSection, setTargetSection] = useState({
    year: '',
    branch: '',
    section: ''
  });

  // حالة عرض حقول الأقسام المستهدفة
  const [showTargetFields, setShowTargetFields] = useState(false);

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
      section: ''
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

  // دالة لإرسال النموذج
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // التحقق من وجود أقسام مستهدفة إذا كان الهدف مخصصًا
    if (event.target === 'custom' && event.targets.length === 0) {
      alert('يرجى إضافة قسم مستهدف واحد على الأقل');
      return;
    }
    
    try {
      // تحويل التاريخ والوقت إلى طابع زمني
      const dateTimestamp = convertToTimestamp(event.date, event.time);
      
      // إعداد بيانات الفعالية للإرسال
      const eventData = {
        title: event.title,
        date: dateTimestamp,
        type: event.type,
        time: event.time,
        target: event.target,
        targets: event.target === 'custom' ? event.targets : []
      };
      
      if (isEditing && eventId) {
        // تحديث الفعالية الموجودة
        await updateDoc(doc(db, 'events', eventId), {
          ...eventData,
          updatedAt: serverTimestamp()
        });
        alert('تم تعديل الفعالية بنجاح');
      } else {
        // إضافة فعالية جديدة
        await addDoc(collection(db, 'events'), {
          ...eventData,
          createdAt: serverTimestamp()
        });
        alert('تم إضافة الفعالية بنجاح');
      }
      
      // العودة إلى صفحة الفعاليات
      navigate('/events');
      
    } catch (error) {
      console.error('خطأ في حفظ الفعالية:', error);
      alert('حدث خطأ أثناء حفظ الفعالية');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="bg-gradient-to-r from-sky-400 to-sky-500 p-6 rounded-t-lg shadow-lg">
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
            <label className="block text-gray-700 font-semibold mb-2">نوع الفعالية</label>
            <select 
              name="type" 
              value={event.type}
              onChange={handleChange} 
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all appearance-none bg-white"
              required
            >
              <option value="faliat">فعالية</option>
              <option value="fard">فرض</option>
              <option value="nashat">نشاط</option>
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
              value={event.target}
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
                <input 
                  type="text" 
                  name="year" 
                  placeholder="مثال: 1" 
                  value={targetSection.year}
                  onChange={handleTargetSectionChange} 
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all" 
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-semibold mb-2">الشعبة</label>
                <input 
                  type="text" 
                  name="branch" 
                  placeholder="مثال: علوم" 
                  value={targetSection.branch}
                  onChange={handleTargetSectionChange} 
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all" 
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-semibold mb-2">القسم</label>
                <input 
                  type="text" 
                  name="section" 
                  placeholder="مثال: أ" 
                  value={targetSection.section}
                  onChange={handleTargetSectionChange} 
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all" 
                />
              </div>
            </div>
            
            <button 
              type="button" 
              onClick={addTargetSection}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all"
            >
              إضافة قسم
            </button>
            
            {event.targets.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold mb-2">الأقسام المضافة:</h4>
                <ul className="space-y-2">
                  {event.targets.map((target, index) => (
                    <li key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                      <span>
                        السنة: {target.year} | الشعبة: {target.branch} | القسم: {target.sections.join(', ')}
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
            className="flex-1 bg-gradient-to-r from-sky-500 to-sky-600 text-white py-3 px-6 rounded-lg font-bold text-lg hover:from-sky-600 hover:to-sky-700 transition-all shadow-md flex items-center justify-center"
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
