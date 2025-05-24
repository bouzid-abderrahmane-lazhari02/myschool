import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc, updateDoc, query, where, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

const ClassesPage = () => {
  const [classes, setClasses] = useState([]);
  const [newClass, setNewClass] = useState({ name: '', year: '', type: 'branch', branchId: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [branches, setBranches] = useState([]);
  const [selectedType, setSelectedType] = useState('branch');
  const [years] = useState(['1', '2', '3']); // السنوات الدراسية الثلاث
  const [showAddBranchForm, setShowAddBranchForm] = useState(false);
  const [showAddSectionForm, setShowAddSectionForm] = useState(false);
  const [organizedData, setOrganizedData] = useState({});
  
  // استخراج معرف المدرسة من التخزين المحلي أو استخدام قيمة افتراضية
  const schoolId = localStorage.getItem('schoolId') || '001';

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // عند تغيير السنة الدراسية، نقوم بجلب الشعب المتاحة لهذه السنة
    if (newClass.year) {
      fetchBranches(newClass.year);
    } else {
      setBranches([]);
    }
    // إعادة تعيين الشعبة المختارة عند تغيير السنة
    setNewClass(prev => ({ ...prev, branchId: '' }));
  }, [newClass.year]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // جلب جميع البيانات (الشعب والأقسام) لعرضها في الجدول
      const allData = [];
      const organizedStructure = {};
      
      // جلب الشعب لكل سنة دراسية
      for (const year of years) {
        organizedStructure[year] = { name: getYearName(year), branches: {} };
        
        const branchesPath = `school/${schoolId}/years/${year}/branches`;
        const branchesSnapshot = await getDocs(collection(db, branchesPath));
        
        for (const branchDoc of branchesSnapshot.docs) {
          const branchData = {
            id: branchDoc.id,
            name: branchDoc.data().name,
            year: year,
            type: 'branch',
            path: `${branchesPath}/${branchDoc.id}`
          };
          allData.push(branchData);
          
          // إضافة الشعبة إلى الهيكل المنظم
          organizedStructure[year].branches[branchDoc.id] = {
            name: branchDoc.data().name,
            sections: []
          };
          
          // جلب الأقسام لكل شعبة
          const sectionsPath = `${branchesPath}/${branchDoc.id}/sectoins`;
          const sectionsSnapshot = await getDocs(collection(db, sectionsPath));
          
          sectionsSnapshot.docs.forEach(sectionDoc => {
            const sectionData = {
              id: sectionDoc.id,
              name: sectionDoc.data().name,
              year: year,
              type: 'section',
              branchId: branchDoc.id,
              branchName: branchDoc.data().name,
              path: `${sectionsPath}/${sectionDoc.id}`
            };
            
            allData.push(sectionData);
            
            // إضافة القسم إلى الهيكل المنظم
            organizedStructure[year].branches[branchDoc.id].sections.push({
              id: sectionDoc.id,
              name: sectionDoc.data().name
            });
          });
        }
      }
      
      setClasses(allData);
      setOrganizedData(organizedStructure);
    } catch (error) {
      console.error('خطأ في جلب البيانات:', error);
      setError('حدث خطأ أثناء جلب البيانات');
    } finally {
      setLoading(false);
    }
  };

  // دالة مساعدة للحصول على اسم السنة الدراسية
  const getYearName = (year) => {
    switch(year) {
      case '1': return 'السنة الأولى';
      case '2': return 'السنة الثانية';
      case '3': return 'السنة الثالثة';
      default: return `السنة ${year}`;
    }
  };

  const fetchBranches = async (year) => {
    try {
      const branchesPath = `school/${schoolId}/years/${year}/branches`;
      const branchesSnapshot = await getDocs(collection(db, branchesPath));
      const branchesData = branchesSnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name
      }));
      setBranches(branchesData);
    } catch (error) {
      console.error('خطأ في جلب بيانات الشعب:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewClass(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTypeChange = (e) => {
    const value = e.target.value;
    setSelectedType(value);
    setNewClass(prev => ({
      ...prev,
      type: value,
      // إعادة تعيين الشعبة إذا تم اختيار نوع "شعبة"
      branchId: value === 'branch' ? '' : prev.branchId
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // التحقق من صحة البيانات
    if (!newClass.name || !newClass.year) {
      setError('يرجى ملء الحقول المطلوبة');
      return;
    }

    // التحقق من اختيار الشعبة إذا كان النوع "قسم"
    if (newClass.type === 'section' && !newClass.branchId) {
      setError('يرجى اختيار الشعبة للقسم');
      return;
    }

    setLoading(true);
    try {
      if (isEditing && editId) {
        // تحديث قسم/شعبة موجودة
        if (newClass.type === 'branch') {
          const branchPath = `school/${schoolId}/years/${newClass.year}/branches/${editId}`;
          await setDoc(doc(db, branchPath), {
            name: newClass.name,
            updatedAt: new Date()
          }, { merge: true });
        } else {
          const sectionPath = `school/${schoolId}/years/${newClass.year}/branches/${newClass.branchId}/sectoins/${editId}`;
          await setDoc(doc(db, sectionPath), {
            name: newClass.name,
            updatedAt: new Date()
          }, { merge: true });
        }
        setSuccess('تم تحديث البيانات بنجاح');
      } else {
        // إضافة قسم/شعبة جديدة
        if (newClass.type === 'branch') {
          // استخدام اسم الشعبة كمعرف لها
          const branchDocRef = doc(db, `school/${schoolId}/years/${newClass.year}/branches`, newClass.name);
          await setDoc(branchDocRef, {
            name: newClass.name,
            createdAt: new Date()
          });
        } else {
          // إضافة قسم جديد - استخدام اسم القسم كمعرف له
          const sectionDocRef = doc(db, `school/${schoolId}/years/${newClass.year}/branches/${newClass.branchId}/sectoins`, newClass.name);
          await setDoc(sectionDocRef, {
            name: newClass.name,
            createdAt: new Date()
          });
        }
        setSuccess(`تم إضافة ${newClass.type === 'branch' ? 'الشعبة' : 'القسم'} بنجاح`);
      }

      // إعادة تعيين النموذج وجلب البيانات المحدثة
      setNewClass({ name: '', year: '', type: 'branch', branchId: '' });
      setSelectedType('branch');
      setIsEditing(false);
      setEditId(null);
      setShowAddBranchForm(false);
      setShowAddSectionForm(false);
      fetchData();
    } catch (error) {
      console.error('خطأ في حفظ البيانات:', error);
      setError('حدث خطأ أثناء حفظ البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (classItem) => {
    setNewClass({
      name: classItem.name,
      year: classItem.year,
      type: classItem.type,
      branchId: classItem.branchId || ''
    });
    setSelectedType(classItem.type);
    setIsEditing(true);
    setEditId(classItem.id);
    
    // فتح النموذج المناسب حسب نوع العنصر
    if (classItem.type === 'branch') {
      setShowAddBranchForm(true);
      setShowAddSectionForm(false);
    } else {
      setShowAddSectionForm(true);
      setShowAddBranchForm(false);
    }
    
    // جلب الشعب المتاحة للسنة الدراسية المختارة
    if (classItem.year) {
      fetchBranches(classItem.year);
    }
  };

  const handleDelete = async (classItem) => {
    if (window.confirm('هل أنت متأكد من رغبتك في حذف هذا العنصر؟')) {
      setLoading(true);
      try {
        if (classItem.type === 'branch') {
          // التحقق مما إذا كانت الشعبة تحتوي على أقسام
          const sectionsPath = `school/${schoolId}/years/${classItem.year}/branches/${classItem.id}/sectoins`;
          const sectionsSnapshot = await getDocs(collection(db, sectionsPath));
          
          if (!sectionsSnapshot.empty) {
            setError('لا يمكن حذف الشعبة لأنها تحتوي على أقسام. يرجى حذف الأقسام أولاً.');
            setLoading(false);
            return;
          }
          
          // حذف الشعبة
          await deleteDoc(doc(db, `school/${schoolId}/years/${classItem.year}/branches/${classItem.id}`));
        } else {
          // حذف القسم
          await deleteDoc(doc(db, `school/${schoolId}/years/${classItem.year}/branches/${classItem.branchId}/sectoins/${classItem.id}`));
        }
        
        setSuccess('تم الحذف بنجاح');
        fetchData();
      } catch (error) {
        console.error('خطأ في الحذف:', error);
        setError('حدث خطأ أثناء محاولة الحذف');
      } finally {
        setLoading(false);
      }
    }
  };

  const cancelEdit = () => {
    setNewClass({ name: '', year: '', type: 'branch', branchId: '' });
    setSelectedType('branch');
    setIsEditing(false);
    setEditId(null);
    setShowAddBranchForm(false);
    setShowAddSectionForm(false);
  };

  const showBranchForm = () => {
    setNewClass({ name: '', year: '', type: 'branch', branchId: '' });
    setSelectedType('branch');
    setIsEditing(false);
    setEditId(null);
    setShowAddBranchForm(true);
    setShowAddSectionForm(false);
  };

  const showSectionForm = () => {
    setNewClass({ name: '', year: '', type: 'section', branchId: '' });
    setSelectedType('section');
    setIsEditing(false);
    setEditId(null);
    setShowAddSectionForm(true);
    setShowAddBranchForm(false);
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <h1 className="text-3xl font-bold text-blue-800 mb-6">إدارة الأقسام والشعب</h1>

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

      {/* أزرار إضافة شعبة وقسم */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={showBranchForm}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <span className="mr-2">+</span>
          إضافة شعبة جديدة
        </button>
        <button
          onClick={showSectionForm}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
        >
          <span className="mr-2">+</span>
          إضافة قسم جديد
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* نموذج إضافة/تعديل شعبة أو قسم */}
        {(showAddBranchForm || showAddSectionForm) && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">
              {isEditing ? 'تعديل البيانات' : `إضافة ${selectedType === 'branch' ? 'شعبة جديدة' : 'قسم جديد'}`}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* اختيار السنة الدراسية */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">السنة الدراسية *</label>
                <select
                  name="year"
                  value={newClass.year}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">-- اختر السنة الدراسية --</option>
                  <option value="1">أولى</option>
                  <option value="2">ثانية</option>
                  <option value="3">الثالثة</option>
                </select>
              </div>

              {/* اختيار الشعبة (يظهر فقط إذا كان النوع "قسم" وتم اختيار السنة) */}
              {selectedType === 'section' && newClass.year && (
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">الشعبة *</label>
                  <select
                    name="branchId"
                    value={newClass.branchId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">-- اختر الشعبة --</option>
                    {branches.map(branch => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name}
                      </option>
                    ))}
                  </select>
                  {branches.length === 0 && (
                    <p className="text-yellow-600 text-sm mt-1">
                      لا توجد شعب متاحة لهذه السنة. يرجى إضافة شعبة أولاً.
                    </p>
                  )}
                </div>
              )}

              {/* اسم القسم/الشعبة */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  {selectedType === 'branch' ? 'اسم الشعبة *' : 'اسم القسم *'}
                </label>
                <input
                  type="text"
                  name="name"
                  value={newClass.name}
                  onChange={handleInputChange}
                  placeholder={selectedType === 'branch' ? 'مثال: رياضيات، علوم، لغات' : 'مثال: علمي، أدبي'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                {selectedType === 'branch' && (
                  <p className="text-gray-600 text-sm mt-1">
                    سيتم استخدام اسم الشعبة كمعرف لها في قاعدة البيانات.
                  </p>
                )}
              </div>

              <div className="flex space-x-4 space-x-reverse">
                <button
                  type="submit"
                  disabled={loading}
                  className={`bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {loading ? 'جاري المعالجة...' : (isEditing ? 'تحديث' : 'إضافة')}
                </button>

                <button
                  type="button"
                  onClick={cancelEdit}
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        )}

        {/* عرض السنوات والشعب والأقسام بشكل هرمي */}
        <div className={`bg-white rounded-lg shadow-md p-6 ${(showAddBranchForm || showAddSectionForm) ? 'md:col-span-1' : 'md:col-span-2'}`}>
          <h2 className="text-xl font-bold mb-4">الهيكل التنظيمي للمدرسة</h2>
          
          {loading && Object.keys(organizedData).length === 0 ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : Object.keys(organizedData).length > 0 ? (
            <div className="space-y-6">
              {Object.keys(organizedData).map(yearKey => (
                <div key={yearKey} className="border rounded-lg p-4">
                  <h3 className="text-lg font-bold text-blue-700 mb-3">
                    {organizedData[yearKey].name}
                  </h3>
                  
                  {Object.keys(organizedData[yearKey].branches).length > 0 ? (
                    <div className="space-y-4 pr-6">
                      {Object.keys(organizedData[yearKey].branches).map(branchKey => {
                        const branch = organizedData[yearKey].branches[branchKey];
                        return (
                          <div key={branchKey} className="border-r-2 border-blue-400 pr-4 pb-2">
                            <div className="flex justify-between items-center">
                              <h4 className="text-md font-semibold text-blue-600">
                                شعبة: {branch.name}
                              </h4>
                              <div className="flex space-x-2 space-x-reverse">
                                <button
                                  onClick={() => handleEdit({
                                    id: branchKey,
                                    name: branch.name,
                                    year: yearKey,
                                    type: 'branch'
                                  })}
                                  className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 transition-colors text-sm"
                                >
                                  تعديل
                                </button>
                                <button
                                  onClick={() => handleDelete({
                                    id: branchKey,
                                    name: branch.name,
                                    year: yearKey,
                                    type: 'branch'
                                  })}
                                  className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition-colors text-sm"
                                >
                                  حذف
                                </button>
                              </div>
                            </div>
                            
                            {branch.sections.length > 0 ? (
                              <ul className="mt-2 space-y-2 pr-6">
                                {branch.sections.map(section => (
                                  <li key={section.id} className="border-r-2 border-green-400 pr-4 py-1">
                                    <div className="flex justify-between items-center">
                                      <span className="text-green-700">
                                        قسم: {section.name}
                                      </span>
                                      <div className="flex space-x-2 space-x-reverse">
                                        <button
                                          onClick={() => handleEdit({
                                            id: section.id,
                                            name: section.name,
                                            year: yearKey,
                                            type: 'section',
                                            branchId: branchKey,
                                            branchName: branch.name
                                          })}
                                          className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 transition-colors text-xs"
                                        >
                                          تعديل
                                        </button>
                                        <button
                                          onClick={() => handleDelete({
                                            id: section.id,
                                            name: section.name,
                                            year: yearKey,
                                            type: 'section',
                                            branchId: branchKey
                                          })}
                                          className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition-colors text-xs"
                                        >
                                          حذف
                                        </button>
                                      </div>
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-gray-500 text-sm mt-1 pr-6">
                                لا توجد أقسام في هذه الشعبة
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-500 pr-6">
                      لا توجد شعب مضافة لهذه السنة
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-10">لا توجد أقسام أو شعب مضافة حتى الآن</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClassesPage;