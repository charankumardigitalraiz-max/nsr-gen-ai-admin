import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  BookOpen,
  Building2,
  TrendingUp,
  LogOut,
  Contact,
  MessageSquare,
  ChevronDown,
  GraduationCap,
  Quote,
  ClipboardList,
} from 'lucide-react';
import NavLogo from './NavLogo';
import { ROUTES } from '../constants/routes';

const STUDENT_SUB_ITEMS = [
  { to: ROUTES.studentsAll, label: 'All', useTotal: true, dotClass: 'bg-slate-400' },
  { to: ROUTES.studentsPlaced, label: 'Placed', countKey: 'studentsPlaced', dotClass: 'bg-emerald-400' },
  { to: ROUTES.studentsJobPending, label: 'Job Pending', countKey: 'studentsJobPending', dotClass: 'bg-amber-400' },
  { to: ROUTES.studentsStudying, label: 'Studying', countKey: 'studentsStudying', dotClass: 'bg-sky-400' },
];

const navItemBase =
  'group flex items-center justify-between gap-2 w-full px-2 py-1.5 rounded-[0.625rem] text-[0.8125rem] font-medium border border-transparent transition-all duration-200 cursor-pointer bg-transparent font-[inherit] text-left no-underline';
const navItemIdle = 'text-slate-600 hover:bg-[#1b4332]/5 hover:text-[#1b4332]';
const iconBase = 'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-200';
const iconIdle = 'bg-[#1b4332]/5 text-slate-500 group-hover:bg-[#00a86b]/10 group-hover:text-[#00a86b]';
const badgeBase =
  'px-1.5 py-0.5 rounded-md text-[10px] font-bold font-mono leading-tight shrink-0 admin-nav-badge';
const subItemBase =
  'flex items-center justify-between gap-2 -ml-px py-1.5 pr-2.5 pl-3.5 rounded-r-lg text-xs font-medium border border-transparent border-l-2 border-l-transparent transition-all duration-200 no-underline';
const subItemIdle = 'text-slate-500 hover:bg-[#1b4332]/4 hover:text-[#1b4332]';

function SidebarLink({ to, icon: Icon, label, count, end = false }) {
  return (
    <li>
      <NavLink
        to={to}
        end={end}
        className={({ isActive }) =>
          `${navItemBase} ${isActive ? 'admin-nav-item-active' : navItemIdle}`
        }
      >
        {({ isActive }) => (
          <>
            <div className="flex items-center gap-2.5 min-w-0">
              <span className={`${iconBase} ${isActive ? 'admin-nav-icon-active' : iconIdle}`}>
                <Icon size={16} strokeWidth={2.25} />
              </span>
              <span className="truncate">{label}</span>
            </div>
            {count != null && <span className={badgeBase}>{count}</span>}
          </>
        )}
      </NavLink>
    </li>
  );
}

function SidebarSection({ title, children }) {
  return (
    <div className="mb-2">
      {title && (
        <div className="px-2.5 pt-2 pb-1.5 mb-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
          {title}
        </div>
      )}
      <ul className="flex flex-col gap-0.5 list-none p-0 m-0">{children}</ul>
    </div>
  );
}

export default function Sidebar({ counts, onLogout }) {
  const { pathname } = useLocation();
  const isStudentsRoute = pathname.startsWith('/students');
  const [studentsOpen, setStudentsOpen] = useState(isStudentsRoute);

  useEffect(() => {
    if (isStudentsRoute) setStudentsOpen(true);
  }, [isStudentsRoute]);

  const studentsTotal =
    (counts.studentsPlaced ?? counts.placements ?? 0) +
    (counts.studentsJobPending ?? 0) +
    (counts.studentsStudying ?? 0);

  const getCount = (key) => (key && counts[key] != null ? counts[key] : null);

  return (
    <aside className="admin-sidebar-shell w-60 shrink-0 sticky top-0 h-screen flex flex-col border-r border-[#1b4332]/8 overflow-hidden">
      <div className="flex items-center gap-3.5 px-4 pt-5 pb-4 border-b border-[#1b4332]/8 shrink-0">
        <div className="w-11 h-11 rounded-xl bg-white border border-[#1b4332]/10 flex items-center justify-center shrink-0 shadow-sm">
          <NavLogo className="h-10 w-10" id="sidebar" />
        </div>
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[15px] font-extrabold tracking-tight text-[#1b4332] leading-none">
              NSR Admin
            </span>
            <span className="admin-sidebar-pill text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded leading-none">
              CMS
            </span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1.5 font-medium truncate">
            GenAI ProSkills Academy
          </span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-3.5 flex flex-col gap-1 [scrollbar-width:thin] [scrollbar-color:rgba(27,67,50,0.15)_transparent]">
        <SidebarSection>
          <SidebarLink to={ROUTES.overview} icon={TrendingUp} label="Dashboard" end />
        </SidebarSection>

        <SidebarSection title="Content">
          <SidebarLink
            to={ROUTES.enrollments}
            icon={ClipboardList}
            label="Enrollments"
            count={getCount('enrollmentsNew') ?? getCount('enrollments')}
          />
          <SidebarLink
            to={ROUTES.courses}
            icon={BookOpen}
            label="Courses"
            count={getCount('courses')}
          />

          <li>
            <button
              type="button"
              className={`group ${navItemBase} ${isStudentsRoute ? 'admin-nav-group-active' : navItemIdle}`}
              onClick={() => setStudentsOpen((open) => !open)}
              aria-expanded={studentsOpen}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className={`${iconBase} ${isStudentsRoute ? 'admin-nav-icon-active' : iconIdle}`}
                >
                  <GraduationCap size={16} strokeWidth={2.25} />
                </span>
                <span className="truncate">Students</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className={badgeBase}>{studentsTotal}</span>
                <ChevronDown
                  size={14}
                  className={`text-slate-400 transition-transform duration-200 ${studentsOpen ? 'rotate-180' : ''}`}
                />
              </div>
            </button>

            <div
              className={`grid transition-[grid-template-rows] duration-200 ease-out ${
                studentsOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
              }`}
            >
              <ul className="overflow-hidden list-none p-0 m-0 ml-6 pt-0.5 pb-1 border-l border-[#1b4332]/10 flex flex-col gap-px">
                {STUDENT_SUB_ITEMS.map((sub) => {
                  const count = getCount(sub.countKey);
                  return (
                    <li key={sub.to}>
                      <NavLink
                        to={sub.to}
                        className={({ isActive }) =>
                          `${subItemBase} ${isActive ? 'admin-nav-subitem-active' : subItemIdle}`
                        }
                      >
                        <span className="flex items-center gap-2.5 min-w-0">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${sub.dotClass}`} />
                          <span className="truncate">{sub.label}</span>
                        </span>
                        {count != null && count !== undefined && (
                          <span className={`${badgeBase} text-[9px] px-1.5`}>{count}</span>
                        )}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          </li>

          <SidebarLink
            to={ROUTES.partners}
            icon={Building2}
            label="Hiring Partners"
            count={getCount('partner')}
          />
          <SidebarLink to={ROUTES.staff} icon={Contact} label="Staff" count={getCount('staff')} />
        </SidebarSection>

        <SidebarSection title="Testimonials">
          <SidebarLink
            to={ROUTES.studentTestimonials}
            icon={MessageSquare}
            label="Student Reviews"
            count={getCount('video')}
          />
          <SidebarLink
            to={ROUTES.enrollments}
            icon={Quote}
            label="Enrollment Forms"
            count={getCount('recruiter')}
          />
        </SidebarSection>
      </nav>

      <div className="shrink-0 px-3 pt-3.5 pb-4 border-t border-[#1b4332]/8 flex flex-col gap-2.5 bg-slate-50/80">
        {/* <div className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-white/4 text-[11px] font-medium text-white/40">
          <span className="w-1.5 h-1.5 rounded-full shrink-0 admin-sidebar-status-dot" />
          <span>API connected</span>
        </div> */}
        <button
          type="button"
          onClick={onLogout}
          className="admin-sidebar-logout flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-[0.625rem] text-[0.8125rem] font-semibold cursor-pointer transition-all duration-200 font-[inherit]"
        >
          <LogOut size={15} strokeWidth={2.25} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
