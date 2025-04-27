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
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/add" element={<AddEventForm />} />
          <Route path="/schedules" element={<Schedules />} />
          {/* المسارات الأخرى... */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;