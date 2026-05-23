import { Navigate, Route, Routes } from 'react-router-dom';

import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { RoleRedirect } from './components/RoleRedirect';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { CandidateRecommendationPage } from './pages/CandidateRecommendationPage';
import { JobUploadPage } from './pages/JobUploadPage';
import { LoginPage } from './pages/LoginPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { RegisterPage } from './pages/RegisterPage';
import { ChatbotPage } from './pages/ChatbotPage';
import RecruiterDashboard from './pages/RecruiterDashboard';
import StudentInterviewPage from './pages/student/StudentInterviewPage';
import StudentCodingPage from './pages/student/StudentCodingPage';
import StudentDSAQuestionsPage from './pages/student/StudentDSAQuestionsPage';
import StudentAptitudePage from './pages/student/StudentAptitudePage';
import StudentCareerAssistantPage from './pages/student/StudentCareerAssistantPage';
import StudentATSPage from './pages/student/StudentATSPage';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentResumePage from './pages/student/StudentResumePage';
import StudentRolesPage from './pages/student/StudentRolesPage';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/home" element={<RoleRedirect />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/home" replace />} />

          {/* Student portal */}
          <Route path="student" element={<StudentDashboard />} />
          <Route path="student/resume" element={<StudentResumePage />} />
          <Route path="student/ats" element={<StudentATSPage />} />
          <Route path="student/roles" element={<StudentRolesPage />} />
          <Route path="student/dsa" element={<StudentDSAQuestionsPage />} />
          <Route path="student/interviews" element={<StudentInterviewPage />} />
          <Route path="student/coding" element={<StudentCodingPage />} />
          <Route path="student/aptitude" element={<StudentAptitudePage />} />
          <Route path="student/career" element={<StudentCareerAssistantPage />} />
          <Route path="student/chatbot" element={<ChatbotPage />} />

          {/* Recruiter portal */}
          <Route path="recruiter" element={<RecruiterDashboard />} />
          <Route path="jobs/upload" element={<JobUploadPage />} />
          <Route path="recommendations/candidates" element={<CandidateRecommendationPage />} />
          <Route path="chatbot" element={<ChatbotPage />} />

          {/* Admin */}
          <Route path="admin" element={<AdminDashboardPage />} />

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}
