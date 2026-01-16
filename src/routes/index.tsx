import { Route, Routes, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/components/layout';
import {
  LoginPage,
  RegisterPage,
  DoctorListPage,
  DoctorDetailPage,
  LandingPage,
} from '@/pages';
import {
  MyAppointmentsPage,
  AppointmentHistoryPage,
  FavoriteDoctorsPage,
  PatientProfilePage,
  PrescriptionsPage,
  MedicalRecordsPage,
} from '@/pages/patient';
import {
  DoctorDashboardPage,
  DoctorCalendarPage,
  DoctorPrescriptionsPage,
  ScheduleManagementPage,
  PatientNotesPage,
  AnalyticsPage,
  DoctorProfilePage,
} from '@/pages/doctor';
import { ChatPage } from '@/pages/chat';
import { NotificationsPage } from '@/pages/shared/NotificationsPage';

type UserRole = 'patient' | 'doctor';

const getDefaultRedirectPath = (role?: UserRole): string => {
  return role === 'doctor' ? '/doctor/dashboard' : '/doctors';
};

const RootRedirect = ({ isAuthenticated, userRole }: { isAuthenticated: boolean; userRole?: UserRole }) => {
  if (!isAuthenticated) return <LandingPage />;
  return <Navigate to={getDefaultRedirectPath(userRole)} replace />;
};

const FallbackRedirect = ({ isAuthenticated, userRole }: { isAuthenticated: boolean; userRole?: UserRole }) => {
  if (!isAuthenticated) return <Navigate to="/" replace />;
  return <Navigate to={getDefaultRedirectPath(userRole)} replace />;
};

const createProtectedRoute = (Component: React.ComponentType, allowedRoles?: UserRole[]) => (
  <ProtectedRoute allowedRoles={allowedRoles}>
    <Component />
  </ProtectedRoute>
);

interface AppRoutesProps {
  isAuthenticated: boolean;
  userRole?: UserRole;
}

export const AppRoutes = ({ isAuthenticated, userRole }: AppRoutesProps) => (
  <Routes>
    {/* Public routes */}
    <Route path="/" element={<RootRedirect isAuthenticated={isAuthenticated} userRole={userRole} />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />

    {/* Patient routes */}
    <Route path="/doctors" element={createProtectedRoute(DoctorListPage, ['patient'])} />
    <Route path="/doctors/:id" element={createProtectedRoute(DoctorDetailPage, ['patient'])} />
    <Route path="/patient/appointments" element={createProtectedRoute(MyAppointmentsPage, ['patient'])} />
    <Route path="/patient/history" element={createProtectedRoute(AppointmentHistoryPage, ['patient'])} />
    <Route path="/patient/favorites" element={createProtectedRoute(FavoriteDoctorsPage, ['patient'])} />
    <Route path="/patient/profile" element={createProtectedRoute(PatientProfilePage, ['patient'])} />
    <Route path="/patient/prescriptions" element={createProtectedRoute(PrescriptionsPage, ['patient'])} />
    <Route path="/patient/records" element={createProtectedRoute(MedicalRecordsPage, ['patient'])} />

    {/* Doctor routes */}
    <Route path="/doctor/dashboard" element={createProtectedRoute(DoctorDashboardPage, ['doctor'])} />
    <Route path="/doctor/calendar" element={createProtectedRoute(DoctorCalendarPage, ['doctor'])} />
    <Route path="/doctor/schedule" element={createProtectedRoute(ScheduleManagementPage, ['doctor'])} />
    <Route path="/doctor/notes" element={createProtectedRoute(PatientNotesPage, ['doctor'])} />
    <Route path="/doctor/prescriptions" element={createProtectedRoute(DoctorPrescriptionsPage, ['doctor'])} />
    <Route path="/doctor/analytics" element={createProtectedRoute(AnalyticsPage, ['doctor'])} />
    <Route path="/doctor/profile" element={createProtectedRoute(DoctorProfilePage, ['doctor'])} />

    {/* Shared routes */}
    <Route path="/chat" element={createProtectedRoute(ChatPage)} />
    <Route path="/notifications" element={createProtectedRoute(NotificationsPage)} />

    {/* Fallback */}
    <Route path="*" element={<FallbackRedirect isAuthenticated={isAuthenticated} userRole={userRole} />} />
  </Routes>
);
