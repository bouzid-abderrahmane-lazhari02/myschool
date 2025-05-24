// src/App.js
import { BrowserRouter } from 'react-router-dom';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import AddStudentForm from './components/AddStudentForm';
import AddTeacherForm from './components/AddTeacherForm';
import AddEventForm from './components/AddEventForm';
import ScheduleForm from './firebase/schedule/ScheduleForm';
import Layout from './components/Layout';
import Teachers from './pages/Teachers';
import EditTeacher from './pages/EditTeacher';
import Students from './pages/Students';
import EditStudent from './pages/EditStudent';
import Schedules from './pages/Schedules';
import EventsPage from './EventsPage';
import AttendancePage from './AttendancePage';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// إضافة استيراد صفحة سجلات الغياب
import AbsencesPage from './pages/AbsencesPage';

// إضافة استيراد صفحة الأقسام
import ClassesPage from './pages/ClassesPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* إضافة مسار افتراضي يوجه إلى Dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* صفحة إضافة الجدول بدون Layout */}
        <Route path="/schedule" element={<ScheduleForm />} />
        {/* استخدام مكون Layout كمكون أب لجميع الصفحات الأخرى */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/students" element={<Students />} />
          <Route path="/students/add" element={<AddStudentForm />} />
          <Route path="/edit-student/:id" element={<EditStudent />} />
          <Route path="/teachers" element={<Teachers />} />
          <Route path="/add-teacher" element={<AddTeacherForm />} />
          <Route path="/edit-teacher/:id" element={<EditTeacher />} />
          <Route path="/classes" element={<ClassesPage />} /> {/* إضافة مسار صفحة الأقسام */}
          <Route path="/schedules" element={<Schedules />} />
          <Route path="/absences" element={<AbsencesPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/add" element={<AddEventForm />} />
          <Route path="/attendance" element={<AttendancePage />} />
          {/* المسارات الأخرى... */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;