import { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  BarChart3,
  BookOpen,
  Building2,
  ClipboardList,
  GraduationCap,
  MessageSquare,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react';
import { fetchEnrollments } from '../services/api';

const ENROLLMENT_STATUS = [
  { key: 'new', label: 'New leads', color: 'bg-sky-500' },
  { key: 'contacted', label: 'Contacted', color: 'bg-amber-500' },
  { key: 'closed', label: 'Closed', color: 'bg-emerald-500' },
];

const STUDENT_STATUS = [
  { key: 'studentsPlaced', label: 'Placed', color: 'bg-emerald-500' },
  { key: 'studentsJobPending', label: 'Job pending', color: 'bg-amber-500' },
  { key: 'studentsStudying', label: 'Studying', color: 'bg-sky-500' },
];

function pct(value, total) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

function AnalyticsBar({ label, value, max, colorClass }) {
  const width = max ? Math.max((value / max) * 100, value > 0 ? 6 : 0) : 0;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="font-medium text-slate-600 truncate">{label}</span>
        <span className="font-bold text-[#1b4332] tabular-nums shrink-0">{value}</span>
      </div>
      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

function InsightCard({ icon: Icon, label, value, hint, tone = 'emerald' }) {
  const tones = {
    emerald: 'bg-emerald-50 text-emerald-600',
    teal: 'bg-teal-50 text-teal-600',
    forest: 'bg-[#1b4332]/10 text-[#1b4332]',
    amber: 'bg-amber-50 text-amber-600',
  };

  return (
    <div className="admin-card p-4 flex items-start gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${tones[tone]}`}>
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 m-0">{label}</p>
        <p className="text-xl font-bold text-[#1b4332] tabular-nums mt-1 m-0">{value}</p>
        {hint && <p className="text-xs text-slate-500 mt-1 m-0">{hint}</p>}
      </div>
    </div>
  );
}

export default function Overview() {
  const { counts = {} } = useOutletContext() ?? {};
  const [enrollmentBreakdown, setEnrollmentBreakdown] = useState({ new: 0, contacted: 0, closed: 0 });

  useEffect(() => {
    fetchEnrollments('all')
      .then((rows) => {
        const breakdown = { new: 0, contacted: 0, closed: 0 };
        rows.forEach((row) => {
          const status = row.status || 'new';
          if (status in breakdown) breakdown[status] += 1;
        });
        setEnrollmentBreakdown(breakdown);
      })
      .catch(() => setEnrollmentBreakdown({ new: 0, contacted: 0, closed: 0 }));
  }, []);

  const studentsTotal =
    (counts.studentsPlaced ?? 0) +
    (counts.studentsJobPending ?? 0) +
    (counts.studentsStudying ?? 0);

  const enrollmentsTotal =
    enrollmentBreakdown.new + enrollmentBreakdown.contacted + enrollmentBreakdown.closed;

  const contentItems = useMemo(
    () => [
      { label: 'Courses', value: counts.courses ?? 0, color: 'bg-emerald-500' },
      { label: 'Hiring partners', value: counts.partner ?? 0, color: 'bg-teal-500' },
      { label: 'Staff', value: counts.staff ?? 0, color: 'bg-[#1b4332]' },
      { label: 'Student reviews', value: counts.video ?? 0, color: 'bg-sky-500' },
      { label: 'Recruiter quotes', value: counts.recruiter ?? 0, color: 'bg-violet-500' },
    ],
    [counts],
  );

  const contentMax = Math.max(...contentItems.map((item) => item.value), 1);
  const placementRate = pct(counts.studentsPlaced ?? 0, studentsTotal);
  const leadResponseRate = pct(
    enrollmentBreakdown.contacted + enrollmentBreakdown.closed,
    enrollmentsTotal,
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <BarChart3 size={18} className="text-[#00a86b]" />
        <h2 className="text-base font-bold text-[#1b4332] m-0">Analytics overview</h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <InsightCard
          icon={TrendingUp}
          label="Placement rate"
          value={`${placementRate}%`}
          hint={`${counts.studentsPlaced ?? 0} of ${studentsTotal} students placed`}
          tone="emerald"
        />
        <InsightCard
          icon={ClipboardList}
          label="New enrollments"
          value={counts.enrollmentsNew ?? 0}
          hint={`${counts.enrollments ?? 0} total form submissions`}
          tone="teal"
        />
        <InsightCard
          icon={UserCheck}
          label="Lead follow-up"
          value={`${leadResponseRate}%`}
          hint="Enrollments moved past new status"
          tone="amber"
        />
        <InsightCard
          icon={BookOpen}
          label="Published content"
          value={contentItems.reduce((sum, item) => sum + item.value, 0)}
          hint="Courses, partners, staff & testimonials"
          tone="forest"
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="admin-card p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-[#00a86b]" />
            <h3 className="text-sm font-bold text-[#1b4332] m-0">Student outcomes</h3>
          </div>
          <p className="text-xs text-slate-500 m-0 -mt-1">
            Breakdown of all students by placement status
          </p>
          <div className="flex flex-col gap-3.5">
            {STUDENT_STATUS.map((item) => (
              <AnalyticsBar
                key={item.key}
                label={item.label}
                value={counts[item.key] ?? 0}
                max={studentsTotal || 1}
                colorClass={item.color}
              />
            ))}
          </div>
          <div className="flex h-3 rounded-full overflow-hidden bg-slate-100 mt-1">
            {STUDENT_STATUS.map((item) => {
              const value = counts[item.key] ?? 0;
              if (!studentsTotal || !value) return null;
              return (
                <div
                  key={item.key}
                  className={`${item.color} h-full`}
                  style={{ width: `${pct(value, studentsTotal)}%` }}
                  title={`${item.label}: ${value}`}
                />
              );
            })}
          </div>
        </section>

        <section className="admin-card p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <ClipboardList size={16} className="text-[#00a86b]" />
            <h3 className="text-sm font-bold text-[#1b4332] m-0">Enrollment pipeline</h3>
          </div>
          <p className="text-xs text-slate-500 m-0 -mt-1">
            Website enroll form leads by follow-up stage
          </p>
          <div className="flex flex-col gap-3.5">
            {ENROLLMENT_STATUS.map((item) => (
              <AnalyticsBar
                key={item.key}
                label={item.label}
                value={enrollmentBreakdown[item.key]}
                max={enrollmentsTotal || 1}
                colorClass={item.color}
              />
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2 pt-1">
            {ENROLLMENT_STATUS.map((item) => (
              <div
                key={item.key}
                className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2 text-center"
              >
                <p className="text-lg font-bold text-[#1b4332] tabular-nums m-0">
                  {enrollmentBreakdown[item.key]}
                </p>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mt-0.5 m-0">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="admin-card p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Building2 size={16} className="text-[#00a86b]" />
          <h3 className="text-sm font-bold text-[#1b4332] m-0">Website content distribution</h3>
        </div>
        <p className="text-xs text-slate-500 m-0 -mt-1">
          Live items currently published through the CMS
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {contentItems.map((item) => (
            <AnalyticsBar
              key={item.label}
              label={item.label}
              value={item.value}
              max={contentMax}
              colorClass={item.color}
            />
          ))}
        </div>
      </section>

      <section className="admin-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <GraduationCap size={16} className="text-[#00a86b]" />
          <h3 className="text-sm font-bold text-[#1b4332] m-0">Quick summary</h3>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <SummaryRow
            icon={BookOpen}
            label="Active courses"
            value={counts.courses ?? 0}
          />
          <SummaryRow
            icon={Users}
            label="Total students"
            value={studentsTotal}
          />
          <SummaryRow
            icon={Building2}
            label="Hiring partners"
            value={counts.partner ?? 0}
          />
          <SummaryRow
            icon={MessageSquare}
            label="Student reviews"
            value={counts.video ?? 0}
          />
          <SummaryRow
            icon={ClipboardList}
            label="Enrollment forms"
            value={counts.enrollments ?? 0}
          />
          <SummaryRow
            icon={UserCheck}
            label="Placed students"
            value={counts.studentsPlaced ?? 0}
          />
        </div>
      </section>
    </div>
  );
}

function SummaryRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50/80 px-3.5 py-2.5">
      <span className="flex items-center gap-2 text-xs font-medium text-slate-600 min-w-0">
        <Icon size={14} className="text-[#00a86b] shrink-0" />
        <span className="truncate">{label}</span>
      </span>
      <span className="text-sm font-bold text-[#1b4332] tabular-nums shrink-0">{value}</span>
    </div>
  );
}
