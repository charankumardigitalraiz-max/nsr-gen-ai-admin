import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Save, ArrowRightLeft } from 'lucide-react';
import Modal from '../components/Modal';
import ImageUploadField from '../components/ImageUploadField';
import PageHeader from '../components/PageHeader';
import LoadingState from '../components/LoadingState';
import AdminTableScroll from '../components/AdminTableScroll';

import { fetchResource, saveResource, RESOURCE_KEYS } from '../services/api';
import { resolveUploadUrl } from '../lib/api';

function getCourseSlug(course) {
  if (course?.slug?.trim()) return course.slug.trim();
  if (course?.title) {
    return course.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  return course?.id || '';
}

function buildCourseOptions(courses) {
  const seen = new Set();
  return courses
    .map((course) => ({ ...course, slug: getCourseSlug(course) }))
    .filter((course) => {
      if (!course.slug || seen.has(course.slug)) return false;
      seen.add(course.slug);
      return true;
    });
}

function buildPartnerNames(partners, currentCompany = '') {
  const names = partners.map((p) => p.name).filter(Boolean);
  if (currentCompany && !names.includes(currentCompany)) {
    return [currentCompany, ...names];
  }
  return names;
}

const STUDENT_TYPE_CONFIG = {
  all: {
    title: 'All Students',
    subtitle: 'Every student — placed, placement pending, and studying.',
    addLabel: 'Add Student',
    status: 'studying',
    showCompany: true,
    showPackage: true,
    showAll: true,
  },
  placed: {
    title: 'Placed Students',
    subtitle: 'Students hired at companies with package details.',
    addLabel: 'Add Placed Student',
    status: 'placed',
    showCompany: true,
    showPackage: true,
  },
  'job-pending': {
    title: 'Job Pending Students',
    subtitle: 'Students in interview or placement process.',
    addLabel: 'Add Job Pending Student',
    status: 'job-pending',
    showCompany: true,
    showPackage: false,
  },
  studying: {
    title: 'Studying Students',
    subtitle: 'Currently enrolled and actively learning.',
    addLabel: 'Add Studying Student',
    status: 'studying',
    showCompany: false,
    showPackage: false,
  },
};

const STATUS_FIELD_CONFIG = {
  placed: {
    showRole: true,
    roleRequired: true,
    showCompany: true,
    companyRequired: true,
    companyLabel: 'Hired at (hiring partner)',
    showPackage: true,
    packageRequired: true,
    showPlacementNote: false,
  },
  'job-pending': {
    showRole: true,
    roleRequired: false,
    roleLabel: 'Target role',
    showCompany: true,
    companyRequired: false,
    companyLabel: 'Interviewing with (hiring partner)',
    showPackage: false,
    showPlacementNote: true,
    placementNoteLabel: 'Placement progress note',
    placementNotePlaceholder: 'e.g. Final round scheduled, awaiting offer...',
  },
  studying: {
    showRole: false,
    showCompany: false,
    showPackage: false,
    showPlacementNote: true,
    placementNoteLabel: 'Learning progress note',
    placementNotePlaceholder: 'e.g. Module 3 in progress, strong in labs...',
  },
};

function getStudentStatus(student) {
  return student?.studentStatus || 'placed';
}

function normalizeStudentByStatus(student) {
  const status = getStudentStatus(student);
  const base = { ...student, studentStatus: status };

  if (status === 'studying') {
    return { ...base, company: '', package: '' };
  }
  if (status === 'job-pending') {
    return { ...base, package: '' };
  }
  return base;
}

const STUDENT_STATUS_META = {
  placed: {
    label: 'Placed',
    badgeClass: 'bg-emerald-50 text-emerald-700 ring-emerald-600/15',
  },
  'job-pending': {
    label: 'Placement Pending',
    badgeClass: 'bg-amber-50 text-amber-700 ring-amber-600/15',
  },
  studying: {
    label: 'Studying',
    badgeClass: 'bg-sky-50 text-sky-700 ring-sky-600/15',
  },
};

function StudentStatusBadge({ status }) {
  const meta = STUDENT_STATUS_META[status] || STUDENT_STATUS_META.placed;
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ring-inset ${meta.badgeClass}`}>
      {meta.label}
    </span>
  );
}

function CompanySelect({ label, value, onChange, partners, required = false }) {
  const partnerNames = buildPartnerNames(partners, value);

  return (
    <div className="flex flex-col gap-1.5">
      <label className="admin-label">{label}</label>
      <select
        className="admin-input"
        required={required}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="" disabled={required}>
          {required
            ? partnerNames.length
              ? 'Select a hiring partner'
              : 'No partners — add under Hiring Partners'
            : '— Not specified —'}
        </option>
        {partnerNames.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>
      {partnerNames.length === 0 && (
        <p className="text-[11px] text-slate-400">
          Add companies first in Hiring Partners, then pick one here.
        </p>
      )}
    </div>
  );
}

function StatusFields({ status, formData, setFormData, partners }) {
  const fields = STATUS_FIELD_CONFIG[status] || STATUS_FIELD_CONFIG.placed;

  const handleStatusSwitch = (newStatus) => {
    setFormData((prev) => {
      const next = { ...prev, studentStatus: newStatus };
      if (newStatus === 'studying') {
        next.company = '';
        next.package = '';
      } else if (newStatus === 'job-pending') {
        next.package = '';
      }
      return next;
    });
  };

  return (
    <>
      <div className="flex flex-col gap-1.5">
        <label className="admin-label">Student status</label>
        <select
          className="admin-input"
          required
          value={status}
          onChange={(e) => handleStatusSwitch(e.target.value)}
        >
          <option value="placed">Placed</option>
          <option value="job-pending">Placement Pending</option>
          <option value="studying">Studying</option>
        </select>
      </div>

      {fields.showRole && (
        <div className="flex flex-col gap-1.5">
          <label className="admin-label">{fields.roleLabel || 'Role / designation'}</label>
          <input
            className="admin-input"
            required={fields.roleRequired}
            placeholder="e.g. AI Engineer, Data Analyst"
            value={formData.role || ''}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          />
        </div>
      )}

      {fields.showCompany && (
        <CompanySelect
          label={fields.companyLabel}
          value={formData.company}
          onChange={(company) => setFormData({ ...formData, company })}
          partners={partners}
          required={fields.companyRequired}
        />
      )}

      {fields.showPackage && (
        <div className="flex flex-col gap-1.5">
          <label className="admin-label">Salary package</label>
          <input
            className="admin-input"
            required
            placeholder="e.g. 12 LPA"
            value={formData.package || ''}
            onChange={(e) => setFormData({ ...formData, package: e.target.value })}
          />
        </div>
      )}

      {fields.showPlacementNote && (
        <div className="flex flex-col gap-1.5">
          <label className="admin-label">{fields.placementNoteLabel}</label>
          <textarea
            className="admin-input"
            rows={3}
            placeholder={fields.placementNotePlaceholder}
            value={formData.placementNote || formData.quote || ''}
            onChange={(e) => setFormData({ ...formData, placementNote: e.target.value, quote: e.target.value })}
          />
        </div>
      )}
    </>
  );
}

export default function Placements({ studentType = 'placed', showToast, refreshStats }) {
  const config = STUDENT_TYPE_CONFIG[studentType] || STUDENT_TYPE_CONFIG.placed;
  const [placements, setPlacements] = useState([]);
  const [courses, setCourses] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [statusRowIndex, setStatusRowIndex] = useState(null);
  const [formData, setFormData] = useState({});
  const [statusFormData, setStatusFormData] = useState({});

  const [searchQuery, setSearchQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [placementsData, coursesData, partnersData] = await Promise.all([
        fetchResource(RESOURCE_KEYS.placements),
        fetchResource(RESOURCE_KEYS.courses),
        fetchResource(RESOURCE_KEYS.partners),
      ]);
      setPlacements(placementsData);
      setCourses(coursesData);
      setPartners(partnersData);
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Error loading placement details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const persistPlacements = async (updatedList, successMsg, closeModal = 'edit') => {
    try {
      await saveResource(RESOURCE_KEYS.placements, updatedList);
      showToast(successMsg || 'Saved successfully!');
      fetchData();
      refreshStats();
      if (closeModal === 'edit') setModalOpen(false);
      if (closeModal === 'status') setStatusModalOpen(false);
    } catch (error) {
      showToast(error.message || 'Network error while saving', 'error');
    }
  };

  const handleDelete = (index) => {
    if (!window.confirm('Are you sure you want to delete this placement?')) return;
    const updated = [...placements];
    updated.splice(index, 1);
    persistPlacements(updated, 'Placement deleted successfully', null);
  };

  const openForm = (item = null, index = null) => {
    setEditingItem(index);
    const base = {
      name: '',
      role: '',
      courseSlug: '',
      company: '',
      package: '',
      placementNote: '',
      initial: '',
      image: '',
      imageAlt: '',
      tags: [],
      quote: '',
      studentStatus: config.status,
    };
    if (item) {
      const status = getStudentStatus(item);
      setFormData({
        ...item,
        studentStatus: status,
        placementNote: item.placementNote || item.quote || '',
      });
    } else {
      setFormData(base);
    }
    setModalOpen(true);
  };

  const openStatusModal = (student, index) => {
    setStatusRowIndex(index);
    setStatusFormData({
      ...student,
      studentStatus: getStudentStatus(student),
      placementNote: student.placementNote || student.quote || '',
    });
    setStatusModalOpen(true);
  };

  const validateStatusFields = (data) => {
    const status = getStudentStatus(data);
    const fields = STATUS_FIELD_CONFIG[status];

    if (fields.showRole && fields.roleRequired && !data.role?.trim()) {
      showToast('Please enter a role for this student', 'error');
      return false;
    }
    if (fields.showCompany && fields.companyRequired && !data.company?.trim()) {
      showToast('Please select a hiring partner', 'error');
      return false;
    }
    if (fields.showPackage && fields.packageRequired && !data.package?.trim()) {
      showToast('Please enter the salary package', 'error');
      return false;
    }
    return true;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const status = formData.studentStatus || config.status;
    if (!validateStatusFields({ ...formData, studentStatus: status })) return;

    let cleanFormData = normalizeStudentByStatus({
      ...formData,
      studentStatus: status,
      quote: formData.placementNote || formData.quote || '',
    });

    if (typeof cleanFormData.tags === 'string') {
      cleanFormData.tags = cleanFormData.tags.split(',').map((s) => s.trim()).filter(Boolean);
    }
    if (!cleanFormData.initial && cleanFormData.name) {
      cleanFormData.initial = cleanFormData.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }

    const updated = [...placements];
    if (editingItem !== null) {
      updated[editingItem] = cleanFormData;
    } else {
      updated.push(cleanFormData);
    }
    persistPlacements(updated, 'Placement saved successfully!', 'edit');
  };

  const handleStatusSubmit = (e) => {
    e.preventDefault();
    if (!validateStatusFields(statusFormData)) return;

    const cleanFormData = normalizeStudentByStatus({
      ...placements[statusRowIndex],
      ...statusFormData,
      quote: statusFormData.placementNote || statusFormData.quote || '',
    });

    const updated = [...placements];
    updated[statusRowIndex] = cleanFormData;
    persistPlacements(updated, 'Student status updated successfully!', 'status');
  };

  if (loading) {
    return <LoadingState message="Loading placement data..." />;
  }

  const courseOptions = buildCourseOptions(courses);
  const formStatus = formData.studentStatus || config.status;
  const statusModalStatus = statusFormData.studentStatus || 'placed';

  const filteredPlacements = placements
    .map((student, index) => ({ student, index }))
    .filter(({ student }) => config.showAll || getStudentStatus(student) === config.status)
    .filter(({ student }) => {
      const matchesSearch =
        student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.role?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCourse = courseFilter === 'all' || student.courseSlug === courseFilter;
      return matchesSearch && matchesCourse;
    });

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={config.title}
        subtitle={config.subtitle}
        action={
          <button type="button" className="admin-btn-primary" onClick={() => openForm()}>
            <Plus size={16} /> {config.addLabel}
          </button>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-grow admin-card px-3 py-2 flex items-center gap-2.5">
          <Search size={16} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search students or companies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-none bg-transparent outline-none text-sm text-slate-800 w-full"
          />
        </div>

        <select
          className="admin-input !w-auto sm:min-w-[200px] cursor-pointer bg-white"
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
        >
          <option value="all">All Courses</option>
          {courseOptions.map((c) => (
            <option key={c.slug} value={c.slug}>{c.title}</option>
          ))}
        </select>
      </div>

      <AdminTableScroll>
        <table className="admin-table min-w-[760px]">
          <thead>
            <tr>
              <th className="px-6 py-4 bg-[#f1f8f4]/60 border-b border-[#1b4332]/8 text-[10px] font-bold text-[#1b4332]/60 uppercase tracking-wider">Student</th>
              <th className="px-6 py-4 bg-[#f1f8f4]/60 border-b border-[#1b4332]/8 text-[10px] font-bold text-[#1b4332]/60 uppercase tracking-wider">Course</th>
              <th className="px-6 py-4 bg-[#f1f8f4]/60 border-b border-[#1b4332]/8 text-[10px] font-bold text-[#1b4332]/60 uppercase tracking-wider">Status</th>
              {config.showCompany && (
                <th className="px-6 py-4 bg-[#f1f8f4]/60 border-b border-[#1b4332]/8 text-[10px] font-bold text-[#1b4332]/60 uppercase tracking-wider">Hired By</th>
              )}
              {config.showPackage && (
                <th className="px-6 py-4 bg-[#f1f8f4]/60 border-b border-[#1b4332]/8 text-[10px] font-bold text-[#1b4332]/60 uppercase tracking-wider">Package</th>
              )}
              <th className="px-6 py-4 bg-[#f1f8f4]/60 border-b border-[#1b4332]/8 text-[10px] font-bold text-[#1b4332]/60 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPlacements.map(({ student, index: rowIndex }) => (
              <tr key={rowIndex} className="hover:bg-slate-50/40 border-b border-slate-100 last:border-0">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {student.image ? (
                      <img
                        src={resolveUploadUrl(student.image)}
                        alt={student.name}
                        className="w-9 h-9 rounded-full object-cover bg-slate-100"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-semibold text-xs">
                        {student.initial || student.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-slate-900">{student.name}</div>
                      <div className="text-xs text-slate-400">{student.role || '—'}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {courseOptions.find((c) => c.slug === student.courseSlug)?.title || student.courseSlug}
                </td>
                <td className="px-6 py-4">
                  <StudentStatusBadge status={getStudentStatus(student)} />
                </td>
                {config.showCompany && (
                  <td className="px-6 py-4 text-sm font-semibold text-slate-800">{student.company || '—'}</td>
                )}
                {config.showPackage && (
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-sky-50 text-sky-600 rounded-full text-xs font-semibold">
                      {student.package || '—'}
                    </span>
                  </td>
                )}
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      title="Change status"
                      className="flex items-center gap-1.5 px-3 py-1.5 border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                      onClick={() => openStatusModal(student, rowIndex)}
                    >
                      <ArrowRightLeft size={12} />
                    </button>
                    <button
                      type="button"
                      className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-700 transition-all cursor-pointer"
                      onClick={() => openForm(student, rowIndex)}
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      type="button"
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                      onClick={() => handleDelete(rowIndex)}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </AdminTableScroll>

      <Modal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title="Update student status"
      >
        <form onSubmit={handleStatusSubmit}>
          <div className="p-6 flex flex-col gap-4">
            {statusFormData.name && (
              <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Student</p>
                <p className="text-sm font-semibold text-slate-900">{statusFormData.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {courseOptions.find((c) => c.slug === statusFormData.courseSlug)?.title || statusFormData.courseSlug}
                </p>
              </div>
            )}

            <StatusFields
              status={statusModalStatus}
              formData={statusFormData}
              setFormData={setStatusFormData}
              partners={partners}
            />
          </div>

          <div className="p-6 border-t border-slate-200/80 flex justify-end gap-3 bg-slate-50/50">
            <button
              type="button"
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-sm font-semibold text-slate-700 transition-all cursor-pointer"
              onClick={() => setStatusModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold shadow-sm transition-all cursor-pointer"
            >
              <Save size={16} /> Update Status
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`${editingItem !== null ? 'Edit' : 'Create'} Student`}
      >
        <form onSubmit={handleFormSubmit}>
          <div className="p-6 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="admin-label">Student name</label>
              <input
                className="admin-input"
                required
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="admin-label">Course</label>
              <select
                className="admin-input"
                required
                value={formData.courseSlug || ''}
                onChange={(e) => setFormData({ ...formData, courseSlug: e.target.value })}
              >
                <option value="">Select course</option>
                {courseOptions.map((c) => (
                  <option key={c.slug} value={c.slug}>{c.title}</option>
                ))}
              </select>
            </div>

            <StatusFields
              status={formStatus}
              formData={formData}
              setFormData={setFormData}
              partners={partners}
            />

            <ImageUploadField
              label="Student photo / avatar"
              value={formData.image}
              onChange={(val) => setFormData({ ...formData, image: val })}
            />
            <div className="flex flex-col gap-1.5">
              <label className="admin-label">Tags (comma separated)</label>
              <input
                className="admin-input"
                value={Array.isArray(formData.tags) ? formData.tags.join(', ') : formData.tags || ''}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              />
            </div>
          </div>

          <div className="p-6 border-t border-slate-200/80 flex justify-end gap-3 bg-slate-50/50">
            <button
              type="button"
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-sm font-semibold text-slate-700 transition-all cursor-pointer"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold shadow-sm transition-all cursor-pointer"
            >
              <Save size={16} /> Save Changes
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
