import { useState } from "react";
import { addTeacherToFirestore } from "../firebase/teacher/teacherService";

const years = ["1", "2", "3"];
const branches = ["SE", "SM"];
const sections = ["1a", "2a", "3a", "1b", "2b"];

function AddTeacherForm() {
  const [teacher, setTeacher] = useState({
    uid: "",
    name: "",
    subject: "",
    schoolId: "",
    assignedSections: [], // { year, branch, section }
  });

  const [selectedAssignments, setSelectedAssignments] = useState([]);

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
    await addTeacherToFirestore({ ...teacher, assignedSections: selectedAssignments });
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white shadow rounded-lg space-y-4">
      <input
        type="text"
        name="uid"
        placeholder="معرف الأستاذ"
        onChange={handleChange}
        className="input"
      />
      <input
        type="text"
        name="name"
        placeholder="الاسم الكامل"
        onChange={handleChange}
        className="input"
      />
      <input
        type="text"
        name="subject"
        placeholder="المادة التي يدرسها"
        onChange={handleChange}
        className="input"
      />
      <input
        type="number"
        name="schoolId"
        placeholder="معرف المدرسة"
        onChange={handleChange}
        className="input"
      />

      <div className="space-y-2">
        <h3 className="font-bold">اختر الأقسام التي يدرّس فيها:</h3>
        {years.map((year) =>
          branches.map((branch) =>
            sections.map((section) => {
              const id = `${year}-${branch}-${section}`;
              const selected = selectedAssignments.find(
                (a) =>
                  a.year === year && a.branch === branch && a.section === section
              );
              return (
                <div key={id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={!!selected}
                    onChange={() =>
                      toggleAssignment({ year, branch, section })
                    }
                  />
                  <label>{`السنة ${year} / الشعبة ${branch} / القسم ${section}`}</label>
                </div>
              );
            })
          )
        )}
      </div>

      <button type="submit" className="btn btn-primary">إضافة الأستاذ</button>
    </form>
  );
}

export default AddTeacherForm;
