import React, { useEffect, useMemo, useState } from 'react';
import { Search, Trash2, Mail, Phone, BookOpen } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import LoadingState from '../components/LoadingState';
import AdminTableScroll from '../components/AdminTableScroll';
import {
  deleteEnrollment,
  fetchEnrollments,
  updateEnrollmentStatus,
} from '../services/api';

const STATUS_META = {
  new: { label: 'New', badgeClass: 'bg-sky-50 text-sky-700 ring-sky-600/15' },
  contacted: { label: 'Contacted', badgeClass: 'bg-amber-50 text-amber-700 ring-amber-600/15' },
  closed: { label: 'Closed', badgeClass: 'bg-emerald-50 text-emerald-700 ring-emerald-600/15' },
};

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function Enrollments({ showToast, refreshStats }) {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const loadEnrollments = async (status = statusFilter) => {
    setLoading(true);
    try {
      const data = await fetchEnrollments(status);
      setEnrollments(data);
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Error loading enrollments', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEnrollments(statusFilter);
  }, [statusFilter]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return enrollments;
    return enrollments.filter(
      (row) =>
        row.name?.toLowerCase().includes(q) ||
        row.phone?.includes(q) ||
        row.email?.toLowerCase().includes(q) ||
        row.course?.toLowerCase().includes(q) ||
        row.message?.toLowerCase().includes(q),
    );
  }, [enrollments, searchQuery]);

  const handleStatusChange = async (id, status) => {
    try {
      await updateEnrollmentStatus(id, status);
      showToast('Status updated');
      await loadEnrollments(statusFilter);
      refreshStats();
    } catch (err) {
      showToast(err.message || 'Could not update status', 'error');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete enrollment for ${name}?`)) return;
    try {
      await deleteEnrollment(id);
      showToast('Enrollment deleted');
      await loadEnrollments(statusFilter);
      refreshStats();
    } catch (err) {
      showToast(err.message || 'Could not delete enrollment', 'error');
    }
  };

  if (loading && enrollments.length === 0) {
    return <LoadingState message="Loading enrollments..." />;
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Course Enrollments"
        subtitle="Leads submitted from the website enroll form."
      />

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-grow admin-card px-3 py-2 flex items-center gap-2.5">
          <Search size={16} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search name, phone, course..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-none bg-transparent outline-none text-sm text-slate-800 w-full"
          />
        </div>
        <select
          className="admin-input !w-auto sm:min-w-[180px] cursor-pointer bg-white"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All statuses</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      <AdminTableScroll>
        <table className="admin-table min-w-[880px]">
          <thead>
            <tr>
              <th className="px-6 py-4 bg-[#f1f8f4]/60 border-b border-[#1b4332]/8 text-[10px] font-bold text-[#1b4332]/60 uppercase tracking-wider">Student</th>
              <th className="px-6 py-4 bg-[#f1f8f4]/60 border-b border-[#1b4332]/8 text-[10px] font-bold text-[#1b4332]/60 uppercase tracking-wider">Course</th>
              <th className="px-6 py-4 bg-[#f1f8f4]/60 border-b border-[#1b4332]/8 text-[10px] font-bold text-[#1b4332]/60 uppercase tracking-wider">Message</th>
              <th className="px-6 py-4 bg-[#f1f8f4]/60 border-b border-[#1b4332]/8 text-[10px] font-bold text-[#1b4332]/60 uppercase tracking-wider">Submitted</th>
              <th className="px-6 py-4 bg-[#f1f8f4]/60 border-b border-[#1b4332]/8 text-[10px] font-bold text-[#1b4332]/60 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 bg-[#f1f8f4]/60 border-b border-[#1b4332]/8 text-[10px] font-bold text-[#1b4332]/60 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-500">
                  No enrollment submissions yet.
                </td>
              </tr>
            ) : (
              filtered.map((row) => {
                return (
                  <tr key={row.id} className="hover:bg-slate-50/40 border-b border-slate-100 last:border-0 align-top">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{row.name}</div>
                      <div className="mt-1 flex flex-col gap-0.5 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <Phone size={12} />
                          <a href={`tel:${row.phone}`} className="hover:text-[#00a86b]">{row.phone}</a>
                        </span>
                        {row.email && (
                          <span className="inline-flex items-center gap-1">
                            <Mail size={12} />
                            <a href={`mailto:${row.email}`} className="hover:text-[#00a86b] truncate max-w-[200px]">{row.email}</a>
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-700">
                        <BookOpen size={14} className="text-[#00a86b] shrink-0" />
                        {row.course}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 max-w-xs">
                      <p className="line-clamp-3 whitespace-pre-wrap">{row.message || '—'}</p>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                      {formatDate(row.createdAt)}
                    </td>

                    <td className="px-6 py-4">
                      <select
                        className="admin-input !py-1.5 !text-xs !w-auto min-w-[120px]"
                        value={row.status || 'new'}
                        onChange={(e) => handleStatusChange(row.id, e.target.value)}
                      >
                        {Object.entries(STATUS_META).map(([value, { label }]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </td>
                    
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                        onClick={() => handleDelete(row.id, row.name)}
                      >
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </AdminTableScroll>
    </div>
  );
}
