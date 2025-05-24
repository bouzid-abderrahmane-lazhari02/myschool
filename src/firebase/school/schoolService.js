import { db } from "../../firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";

// دالة لجلب جميع السنوات الدراسية
export async function fetchYears(schoolId) {
  try {
    const yearsRef = collection(db, "school", schoolId, "years");
    const snapshot = await getDocs(yearsRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("خطأ في جلب السنوات الدراسية:", error);
    return [];
  }
}

// دالة لجلب الشعب لسنة دراسية معينة
export async function fetchBranches(schoolId, yearId) {
  try {
    const branchesRef = collection(db, "school", schoolId, "years", yearId, "branches");
    const snapshot = await getDocs(branchesRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("خطأ في جلب الشعب:", error);
    return [];
  }
}

// دالة لجلب الأقسام لشعبة معينة
export async function fetchSections(schoolId, yearId, branchId) {
  try {
    const sectionsRef = collection(db, "school", schoolId, "years", yearId, "branches", branchId, "sectoins");
    const snapshot = await getDocs(sectionsRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("خطأ في جلب الأقسام:", error);
    return [];
  }
}

// دالة لجلب جميع البيانات دفعة واحدة (للاستخدام في الصفحات التي تحتاج لعرض كل البيانات)
export async function fetchAllSchoolData(schoolId) {
  try {
    const years = await fetchYears(schoolId);
    const schoolData = { years: [] };
    
    for (const year of years) {
      const yearData = { id: year.id, name: year.name || year.id, branches: [] };
      const branches = await fetchBranches(schoolId, year.id);
      
      for (const branch of branches) {
        const branchData = { id: branch.id, name: branch.name || branch.id, sections: [] };
        const sections = await fetchSections(schoolId, year.id, branch.id);
        
        branchData.sections = sections.map(section => ({
          id: section.id,
          name: section.name || section.id
        }));
        
        yearData.branches.push(branchData);
      }
      
      schoolData.years.push(yearData);
    }
    
    return schoolData;
  } catch (error) {
    console.error("خطأ في جلب بيانات المدرسة:", error);
    return { years: [] };
  }
}