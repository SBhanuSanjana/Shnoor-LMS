import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/dashboards/AdminDashboard";
import InstituteDashboard from "./pages/dashboards/InstituteDashboard";
import InstructorDashboard from "./pages/dashboards/instructor/InstructorDashboard";
import InstructorOverview from "./pages/dashboards/instructor/InstructorOverview";
import InstructorCourses from "./pages/dashboards/instructor/InstructorCourses";
import CourseBuilder from "./pages/dashboards/instructor/CourseBuilder";
import InstructorAssignments from "./pages/dashboards/instructor/InstructorAssignments";
import InstructorQuizzes from "./pages/dashboards/instructor/InstructorQuizzes";
import StudentProgress from "./pages/dashboards/instructor/StudentProgress";
import StudentDashboard from "./pages/dashboards/student/StudentDashboard";
import StudentOverview from "./pages/dashboards/student/StudentOverview";
import StudentCourses from "./pages/dashboards/student/StudentCourses";
import StudentQuizzes from "./pages/dashboards/student/StudentQuizzes";
import StudentAssignments from "./pages/dashboards/student/StudentAssignments";
import ProgressTracker from "./pages/dashboards/student/ProgressTracker";
import StudentCertificates from "./pages/dashboards/student/StudentCertificates";
import StudentSubscription from "./pages/dashboards/student/StudentSubscription";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/institute-dashboard" element={<InstituteDashboard />} />
        <Route path="/instructor-dashboard" element={<InstructorDashboard />}>
          <Route index element={<InstructorOverview />} />
          <Route path="courses" element={<InstructorCourses />} />
          <Route path="courses/:courseId/build" element={<CourseBuilder />} />
          <Route path="assignments" element={<InstructorAssignments />} />
          <Route path="quizzes" element={<InstructorQuizzes />} />
          <Route path="students" element={<StudentProgress />} />
        </Route>
        <Route path="/student-dashboard" element={<StudentDashboard />}>
          <Route index element={<StudentOverview />} />
          <Route path="courses" element={<StudentCourses />} />
          <Route path="quizzes" element={<StudentQuizzes />} />
          <Route path="assignments" element={<StudentAssignments />} />
          <Route path="progress" element={<ProgressTracker />} />
          <Route path="certificates" element={<StudentCertificates />} />
          <Route path="subscription" element={<StudentSubscription />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;