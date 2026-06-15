import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import StatsOverview from '../components/StatsOverview';
import LoadingState from '../components/LoadingState';
import AdminProfileMenu from '../components/AdminProfileMenu';
import { PAGE_TITLES } from '../constants/routes';
import { getPageStats } from '../utils/pageStats';

export default function DashboardLayout({ counts, loading, onLogout }) {
  const { pathname } = useLocation();
  const pageTitle = PAGE_TITLES[pathname] || 'Dashboard';
  const pageStats = getPageStats(pathname, counts);

  return (
    <div className="admin-shell">
      <Sidebar counts={counts} onLogout={onLogout} />

      <div className="admin-main">
        <header className="admin-topbar">
          <div>
            <h1 className="text-lg font-bold text-[#1b4332] tracking-tight m-0">
              {pageTitle}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5 m-0">
              NSR GenAI ProSkills Academy · Content Manager
            </p>
          </div>
          <AdminProfileMenu onLogout={onLogout} />
        </header>

        <main className="admin-content">
          {loading ? (
            <LoadingState message="Loading dashboard..." />
          ) : (
            <>
              {pageStats && <StatsOverview stats={pageStats} />}
              <Outlet context={{ counts }} />
            </>
          )}
        </main>
      </div>
    </div>
  );
}
