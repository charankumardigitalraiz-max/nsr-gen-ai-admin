import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import LoadingState from './components/LoadingState';
import Login from './pages/Login';
import Overview from './pages/Overview';
import WebsiteContent from './pages/WebsiteContent';
import Courses from './pages/Courses';
import Placements from './pages/Placements';
import Testimonials from './pages/Testimonials';
import Partners from './pages/Partners';
import Staff from './pages/Staff';
import Enrollments from './pages/Enrollments';
import DashboardLayout from './layouts/DashboardLayout';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { ROUTES } from './constants/routes';

import { clearToken, hasAuthSession, setUnauthorizedHandler } from './lib/api';
import { fetchProfile, fetchStats } from './services/api';

function AppRoutes() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(() => hasAuthSession());
  const [counts, setCounts] = useState({
    courses: 0,
    placements: 0,
    studentsPlaced: 0,
    studentsJobPending: 0,
    studentsStudying: 0,
    recruiter: 0,
    video: 0,
    partner: 0,
    staff: 0,
    enrollments: 0,
    enrollmentsNew: 0,
  });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const handleLogout = useCallback((message) => {
    clearToken();
    setIsAuthenticated(false);
    setLoading(false);
    navigate(ROUTES.login, { replace: true });
    if (message) showToast(message, 'error');
  }, [navigate, showToast]);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      handleLogout('Session expired. Please sign in again.');
    });
    return () => setUnauthorizedHandler(null);
  }, [handleLogout]);

  useEffect(() => {
    async function bootstrap() {
      if (!hasAuthSession()) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        await fetchProfile();
        const stats = await fetchStats();
        setCounts(stats);
        setIsAuthenticated(true);
      } catch {
        handleLogout('Session invalid. Please sign in again.');
      } finally {
        setLoading(false);
      }
    }

    bootstrap();
  }, [handleLogout]);

  const refreshStats = async () => {
    try {
      const stats = await fetchStats();
      setCounts(stats);
    } catch (error) {
      console.error('Error refreshing stats:', error);
    }
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    localStorage.setItem('nsr_admin_authenticated', 'true');
    setLoading(true);
    fetchStats()
      .then((stats) => {
        setCounts(stats);
        navigate(ROUTES.overview, { replace: true });
      })
      .catch(() => showToast('Logged in, but could not load dashboard stats', 'error'))
      .finally(() => setLoading(false));
  };

  if (!isAuthenticated && !hasAuthSession() && !loading) {
    return (
      <>
        <Routes>
          <Route path={ROUTES.login} element={<Login onLogin={handleLoginSuccess} showToast={showToast} />} />
          <Route path="*" element={<Navigate to={ROUTES.login} replace />} />
        </Routes>
        {toast && <Toast message={toast.message} type={toast.type} />}
      </>
    );
  }

  if (!isAuthenticated && loading) {
    return <LoadingState message="Checking session..." />;
  }

  const pageProps = { showToast, refreshStats };

  return (
    <>
      <Routes>
        <Route path={ROUTES.login} element={<Navigate to={ROUTES.overview} replace />} />
        <Route
          element={
            <DashboardLayout
              counts={counts}
              loading={loading}
              onLogout={() => handleLogout()}
            />
          }
        >
          <Route index element={<Navigate to={ROUTES.overview} replace />} />
          <Route path="overview" element={<Overview />} />
          <Route path="website" element={<WebsiteContent />} />
          <Route path="courses" element={<Courses {...pageProps} />} />
          <Route path="placements" element={<Navigate to={ROUTES.studentsPlaced} replace />} />
          <Route path="students/all" element={<Placements studentType="all" {...pageProps} />} />
          <Route path="students/placed" element={<Placements studentType="placed" {...pageProps} />} />
          <Route path="students/job-pending" element={<Placements studentType="job-pending" {...pageProps} />} />
          <Route path="students/studying" element={<Placements studentType="studying" {...pageProps} />} />
          <Route path="recruiter" element={<Testimonials type="recruiter" {...pageProps} />} />
          <Route path="student-testimonials" element={<Testimonials type="video" {...pageProps} />} />
          <Route path="partners" element={<Partners {...pageProps} />} />
          <Route path="staff" element={<Staff {...pageProps} />} />
          <Route path="enrollments" element={<Enrollments {...pageProps} />} />
        </Route>
        <Route path="*" element={<Navigate to={ROUTES.overview} replace />} />
      </Routes>
      {toast && <Toast message={toast.message} type={toast.type} />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

function Toast({ message, type }) {
  const Icon = type === 'error' ? AlertCircle : CheckCircle2;
  return (
    <div className={`admin-toast ${type === 'error' ? 'error' : 'success'}`}>
      <Icon size={18} />
      <span>{message}</span>
    </div>
  );
}
