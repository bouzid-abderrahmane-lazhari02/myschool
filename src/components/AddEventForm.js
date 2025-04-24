import { useState } from "react";
import { addEventToFirestore } from "../firebase/event/eventService";

const schoolStructure = {
  1: { branches: { SE: ["1a", "1b"], SM: ["1c"] } },
  2: { branches: { SE: ["2a", "2b"], SM: ["2c"] } },
  3: { branches: { SE: ["3a"], SM: ["3b", "3c"] } },
};

function AddEventForm() {
  const [event, setEvent] = useState({
    title: "",
    date: "",
    time: "",
    type: "",
    schoolId: "",
    target: "all",
    targets: [],
  });

  const [selectedYear, setSelectedYear] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedSections, setSelectedSections] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (
      !event.title ||
      !event.date ||
      !event.time ||
      !event.type ||
      !event.schoolId ||
      (event.target === "custom" && event.targets.length === 0)
    ) {
      alert("يرجى ملء كل الحقول المطلوبة وإضافة الأقسام إذا كان الاستهداف مخصصًا");
      return;
    }
  
    // دمج التاريخ والوقت في timestamp
    const combinedDateTime = new Date(`${event.date}`);
  
    const finalEvent = {
      ...event,
      dateTime: combinedDateTime.toISOString(), // أو .toDate() إذا تستعمل Firestore Timestamp
    };
  
    await addEventToFirestore(finalEvent);
  
    alert("تمت إضافة الفعالية بنجاح ✅");
  
    setEvent({
      title: "",
      date: "",
      time: "",
      type: "",
      schoolId: "",
      target: "all",
      targets: [],
    });
  };
  

  const addTarget = () => {
    if (!selectedYear || !selectedBranch || selectedSections.length === 0)
      return;

    setEvent((prev) => ({
      ...prev,
      targets: [
        ...prev.targets,
        {
          year: selectedYear,
          branch: selectedBranch,
          sections: [...selectedSections],
        },
      ],
    }));

    // Reset selection
    setSelectedYear("");
    setSelectedBranch("");
    setSelectedSections([]);
  };

  const removeTarget = (index) => {
    setEvent((prev) => ({
      ...prev,
      targets: prev.targets.filter((_, i) => i !== index),
    }));
  };

  const toggleSection = (section) => {
    setSelectedSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  const branches = selectedYear
    ? Object.keys(schoolStructure[selectedYear]?.branches || {})
    : [];
  const sections =
    selectedYear && selectedBranch
      ? schoolStructure[selectedYear]?.branches[selectedBranch] || []
      : [];

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-6 bg-white rounded-lg shadow-md max-w-xl mx-auto"
    >
      <input
        name="title"
        placeholder="عنوان الفعالية"
        value={event.title}
        onChange={(e) => setEvent({ ...event, title: e.target.value })}
        className="input w-full"
      />
      <div className="flex gap-4">
        <div className="w-1/2">
          <label className="block mb-1">📅 التاريخ</label>
          <input
            type="date"
            name="date"
            value={event.date}
            onChange={(e) => setEvent({ ...event, date: e.target.value })}
            className="input w-full"
          />
        </div>

        <div className="w-1/2">
          <label className="block mb-1">🕒 الوقت</label>
          <input
            type="time"
            name="time"
            value={event.time}
            onChange={(e) => setEvent({ ...event, time: e.target.value })}
            className="input w-full"
          />
        </div>
      </div>

      <input
        name="schoolId"
        placeholder="معرف المدرسة"
        value={event.schoolId}
        onChange={(e) => setEvent({ ...event, schoolId: e.target.value })}
        className="input w-full"
      />

      <select
        name="type"
        value={event.type}
        onChange={(e) => setEvent({ ...event, type: e.target.value })}
        className="input w-full"
      >
        <option value="">اختر نوع الفعالية</option>
        <option value="antiro">فرض</option>
        <option value="faliat">نشاط</option>
      </select>

      <select
        name="target"
        value={event.target}
        onChange={(e) => setEvent({ ...event, target: e.target.value })}
        className="input w-full"
      >
        <option value="all">المدرسة كاملة</option>
        <option value="custom">تحديد الأقسام</option>
      </select>

      {event.target === "custom" && (
        <div className="bg-gray-50 p-4 rounded-md border">
          <h4 className="font-semibold mb-2">إضافة قسم:</h4>
          <select
            value={selectedYear}
            onChange={(e) => {
              setSelectedYear(e.target.value);
              setSelectedBranch("");
              setSelectedSections([]);
            }}
            className="input w-full"
          >
            <option value="">اختر السنة</option>
            {Object.keys(schoolStructure).map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>

          {branches.length > 0 && (
            <select
              value={selectedBranch}
              onChange={(e) => {
                setSelectedBranch(e.target.value);
                setSelectedSections([]);
              }}
              className="input mt-2 w-full"
            >
              <option value="">اختر الشعبة</option>
              {branches.map((branch) => (
                <option key={branch} value={branch}>
                  {branch}
                </option>
              ))}
            </select>
          )}

          {sections.length > 0 && (
            <div className="mt-2">
              <h5 className="mb-1">الأقسام:</h5>
              {sections.map((sec) => (
                <label key={sec} className="block">
                  <input
                    type="checkbox"
                    checked={selectedSections.includes(sec)}
                    onChange={() => toggleSection(sec)}
                  />
                  <span className="ml-2">{sec}</span>
                </label>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={addTarget}
            className="btn btn-secondary mt-3"
          >
            إضافة المجموعة
          </button>

          {event.targets.length > 0 && (
            <div className="mt-4 text-sm bg-white p-2 rounded border">
              <strong>المجموعات المحددة:</strong>
              <ul className="list-disc list-inside space-y-1 mt-1">
                {event.targets.map((t, i) => (
                  <li key={i} className="flex justify-between items-center">
                    <span>
                      السنة: {t.year}، الشعبة: {t.branch}، الأقسام:{" "}
                      {t.sections.join(", ")}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeTarget(i)}
                      className="text-red-600 hover:underline text-xs"
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

      <button type="submit" className="btn btn-primary w-full">
        نشر الفعالية
      </button>
    </form>
  );
}

export default AddEventForm;
