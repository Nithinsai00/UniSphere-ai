import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layout
import { DashboardLayout } from './components/layout/DashboardLayout';

// Public Pages
import { SplashWelcome } from './pages/SplashWelcome';
import { Login } from './pages/Login';
import { Unauthorized } from './pages/Unauthorized';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminStudents } from './pages/admin/AdminStudents';
import { AdminStudentDetail } from './pages/admin/AdminStudentDetail';
import { AdminFaculty } from './pages/admin/AdminFaculty';
import { AdminAnalytics } from './pages/admin/AdminAnalytics';
import { AdminAtRisk } from './pages/admin/AdminAtRisk';
import { AdminDataIntegration } from './pages/admin/AdminDataIntegration';
import { AdminSegments } from './pages/admin/AdminSegments';
import { AdminInterventions } from './pages/admin/AdminInterventions';
import { AdminReports } from './pages/admin/AdminReports';
import { AdminSettings } from './pages/admin/AdminSettings';

// Faculty Pages
import { FacultyDashboard } from './pages/faculty/FacultyDashboard';
import { FacultyStudents } from './pages/faculty/FacultyStudents';
import { FacultyStudentDetail } from './pages/faculty/FacultyStudentDetail';
import { FacultyInterventions } from './pages/faculty/FacultyInterventions';
import { FacultyReports } from './pages/faculty/FacultyReports';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudentProfile } from './pages/student/StudentProfile';
import { StudentAcademics } from './pages/student/StudentAcademics';
import { StudentAttendance } from './pages/student/StudentAttendance';
import { StudentPlacement } from './pages/student/StudentPlacement';
import { StudentRecommendations } from './pages/student/StudentRecommendations';

// Protected Route Guard
const ProtectedRoute: React.FC<{
  allowedRoles: string[];
  children: React.ReactNode;
}> = ({ allowedRoles, children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F3F7FF] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<SplashWelcome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Admin Protected Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="students" element={<AdminStudents />} />
            <Route path="students/:id" element={<AdminStudentDetail />} />
            <Route path="faculty" element={<AdminFaculty />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="at-risk" element={<AdminAtRisk />} />
            <Route path="data-integration" element={<AdminDataIntegration />} />
            <Route path="segments" element={<AdminSegments />} />
            <Route path="interventions" element={<AdminInterventions />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* Faculty Protected Routes */}
          <Route
            path="/faculty"
            element={
              <ProtectedRoute allowedRoles={['faculty', 'admin']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/faculty/dashboard" replace />} />
            <Route path="dashboard" element={<FacultyDashboard />} />
            <Route path="students" element={<FacultyStudents />} />
            <Route path="students/:id" element={<FacultyStudentDetail />} />
            <Route path="interventions" element={<FacultyInterventions />} />
            <Route path="reports" element={<FacultyReports />} />
          </Route>

          {/* Student Protected Routes */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={['student', 'admin']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/student/dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="profile" element={<StudentProfile />} />
            <Route path="academics" element={<StudentAcademics />} />
            <Route path="attendance" element={<StudentAttendance />} />
            <Route path="placement" element={<StudentPlacement />} />
            <Route path="recommendations" element={<StudentRecommendations />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
