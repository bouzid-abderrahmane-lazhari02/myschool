// src/App.js
// import React, { useState } from 'react';
// import Login from './components/Login';

// function App() {
//   const [loggedIn, setLoggedIn] = useState(false);

//   return (
//     <div>
//       {loggedIn ? (
//         <h1>أهلاً بك في لوحة التحكم</h1> // لاحقًا نبدلها بواجهة المدرسة
//       ) : (
//         <Login onLogin={() => setLoggedIn(true)} />
//       )}
//     </div>
//   );
// }

// export default App;

 
// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import Login from "./Login";
// import Dashboard from "./pages/Dashboard"; // إن وجدت

// function App() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/" element={<Login />} />
//         <Route path="/dashboard" element={<Dashboard />} />
//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App;
// src/App.js
import { BrowserRouter } from 'react-router-dom';
import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import AddStudentForm from './components/AddStudentForm';
import AddTeacherForm from './components/AddTeacherForm';
import AddEventForm from './components/AddEventForm';
import ScheduleForm from './firebase/schedule/ScheduleForm';
// استيراد المكونات الأخرى...

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/students" element={<AddStudentForm />} />
        <Route path="/teachers" element={<AddTeacherForm />} />
        <Route path="/events" element={<AddEventForm />} />
        <Route path="/schedule" element={<ScheduleForm />} />
        {/* المسارات الأخرى... */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;