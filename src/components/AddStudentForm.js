import { useState } from "react";
import { addStudentToFirestore } from "../firebase/student/studentService";

function AddStudentForm() {
  const [students, setStudent] = useState({
    uid: "",
    fullName: "",
    password: "",
    years: "",
    branches: "",
    section: "",
    schoolId: "",
    user: "student",
  });
  
  const handleChange = (e) => {
    setStudent({ ...students, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addStudentToFirestore(students);
  };

  return (
<form onSubmit={handleSubmit} className="p-4 bg-white shadow-md rounded-lg">
  <input type="text" name="uid" placeholder="معرف التلميذ" onChange={handleChange} className="input" />
  <input type="text" name="fullName" placeholder="الاسم الكامل" onChange={handleChange} className="input" />
  <input type="password" name="password" placeholder="كلمة المرور" onChange={handleChange} className="input" />
  <input type="number" name="schoolId" placeholder="معرف المدرسة" onChange={handleChange} className="input" />

  <select name="years" onChange={handleChange} className="input">
    <option>اختر السنة الدراسية</option>
    <option value="1">1</option>
    <option value="2">2</option>
    <option value="3">3</option>
  </select>

  <select name="branches" onChange={handleChange} className="input">
    <option>اختر الشعبة</option>
    <option value="SE">علوم</option>
    <option value="SM">آداب</option>
  </select>

  <select name="section" onChange={handleChange} className="input">
    <option>اختر القسم</option>
    <option value="1a">1</option>
    <option value="2a">2</option>
  </select>

  <button type="submit" className="btn btn-primary mt-4">إضافة التلميذ</button>
</form>

  );
}

export default AddStudentForm;
