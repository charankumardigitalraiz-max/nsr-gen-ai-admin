import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Edit2, Trash2, Save } from 'lucide-react';
import Modal from '../components/Modal';
import ImageUploadField from '../components/ImageUploadField';
import PageHeader from '../components/PageHeader';
import LoadingState from '../components/LoadingState';
import SearchableSelect from '../components/SearchableSelect';

import { fetchResource, saveResource, RESOURCE_KEYS } from '../services/api';
import { resolveUploadUrl } from '../lib/api';

export default function Testimonials({
  type, // 'recruiter' | 'video'
  showToast,
  refreshStats
}) {
  const isVideo = type === 'video';
  const resourceName = isVideo ? RESOURCE_KEYS.video : RESOURCE_KEYS.recruiter;

  const [testimonials, setTestimonials] = useState([]);
  const [partners, setPartners] = useState([]);
  const [placedStudents, setPlacedStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    fetchData();
  }, [type]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const requests = [
        fetchResource(resourceName),
        fetchResource(RESOURCE_KEYS.partners),
      ];
      if (isVideo) {
        requests.push(fetchResource(RESOURCE_KEYS.placements));
      }

      const results = await Promise.all(requests);
      setTestimonials(results[0]);
      setPartners(results[1]);

      if (isVideo) {
        const placements = results[2] || [];
        setPlacedStudents(
          placements.filter((s) => !s.studentStatus || s.studentStatus === 'placed'),
        );
      }
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Error loading testimonials', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchTestimonials = async () => {
    try {
      const data = await fetchResource(resourceName);
      setTestimonials(data);
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Error loading testimonials', 'error');
    }
  };

  const partnerNames = (() => {
    const names = partners.map((p) => p.name).filter(Boolean);
    if (formData.company && !names.includes(formData.company)) {
      return [formData.company, ...names];
    }
    return names;
  })();

  const placedStudentOptions = useMemo(() => {
    const list = [...placedStudents];
    if (
      formData.studentName &&
      !list.some((s) => s.name === formData.studentName)
    ) {
      list.unshift({
        name: formData.studentName,
        role: formData.role,
        company: formData.company,
        image: formData.avatar,
      });
    }
    return list;
  }, [placedStudents, formData.studentName, formData.role, formData.company, formData.avatar]);

  const studentSelectOptions = useMemo(
    () =>
      placedStudentOptions.map((student) => ({
        value: student.name,
        label: student.name,
        sublabel: [student.role, student.company, student.package].filter(Boolean).join(' · '),
        student,
      })),
    [placedStudentOptions],
  );

  const loadPlacedStudents = async () => {
    const placements = await fetchResource(RESOURCE_KEYS.placements);
    setPlacedStudents(
      placements.filter((s) => !s.studentStatus || s.studentStatus === 'placed'),
    );
  };

  const handlePlacedStudentChange = (name, option) => {
    const student = option?.student || placedStudents.find((s) => s.name === name);
    if (!student) {
      setFormData({ ...formData, studentName: name || '' });
      return;
    }
    setFormData({
      ...formData,
      studentName: student.name,
      role: student.role || '',
      company: student.company || formData.company || '',
      avatar: student.image || formData.avatar || '',
      review: student.quote || formData.review || '',
    });
  };

  const companySelect = (
    <div className="flex flex-col gap-1.5">
      <label className="admin-label">Company (hiring partner)</label>
      <select
        className="admin-input"
        required
        value={formData.company || ''}
        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
      >
        <option value="" disabled>
          {partnerNames.length ? 'Select a hiring partner' : 'No partners — add them under Hiring Partners'}
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

  const handleSave = async (updatedList, successMsg) => {
    try {
      await saveResource(resourceName, updatedList);
      showToast(successMsg || 'Saved successfully!');
      fetchTestimonials();
      refreshStats();
      setModalOpen(false);
    } catch (error) {
      showToast(error.message || 'Network error while saving', 'error');
    }
  };

  const handleDelete = (index) => {
    if (!window.confirm(`Are you sure you want to delete this testimonial?`)) return;
    const updated = [...testimonials];
    updated.splice(index, 1);
    handleSave(updated, 'Testimonial deleted successfully');
  };

  const openForm = async (item = null, index = null) => {
    setEditingItem(index);
    if (item) {
      setFormData(
        isVideo
          ? { ...item, review: item.review || item.quote || '' }
          : { ...item },
      );
    } else {
      setFormData(isVideo
        ? { studentName: '', role: '', company: '', review: '', avatar: '' }
        : { name: '', role: '', company: '', quote: '', avatar: '' }
      );
    }
    if (isVideo) {
      try {
        await loadPlacedStudents();
      } catch {
        showToast('Could not refresh placed students list', 'error');
      }
    }
    setModalOpen(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (isVideo && !formData.studentName?.trim()) {
      showToast('Please select a placed student', 'error');
      return;
    }
    if (isVideo && !formData.review?.trim()) {
      showToast('Please enter a review', 'error');
      return;
    }
    const cleanFormData = { ...formData };
    if (isVideo) {
      cleanFormData.review = cleanFormData.review.trim();
      cleanFormData.quote = cleanFormData.review;
      delete cleanFormData.videoUrl;
    }

    const updated = [...testimonials];
    if (editingItem !== null) {
      updated[editingItem] = cleanFormData;
    } else {
      updated.push(cleanFormData);
    }
    handleSave(updated, 'Testimonial saved successfully!');
  };

  if (loading) {
    return <LoadingState message="Loading testimonials..." />;
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={isVideo ? 'Student Testimonials' : 'Recruiter Testimonials'}
        subtitle={
          isVideo
            ? 'Written reviews and success stories from placed students.'
            : 'Quotes from corporate hiring partners and talent leads.'
        }
        action={
          <button type="button" className="admin-btn-primary" onClick={() => openForm()}>
            <Plus size={16} /> Add {isVideo ? 'Student Testimonial' : 'Recruiter Quote'}
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {testimonials.map((test, idx) => {
          const name = isVideo ? test.studentName : test.name;
          const reviewText = isVideo ? (test.review || test.quote) : test.quote;
          const resolvedAvatar = test.avatar ? resolveUploadUrl(test.avatar) : null;

          return (
            <div key={idx} className="admin-card p-5 flex flex-col gap-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                {resolvedAvatar ? (
                  <img src={resolvedAvatar} alt={name} className="w-10 h-10 rounded-full object-cover bg-slate-100" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-semibold text-xs">{name ? name[0] : 'U'}</div>
                )}
                <div>
                  <div className="font-semibold text-slate-900">{name}</div>
                  <div className="text-xs text-slate-400">{test.role} at {test.company}</div>
                </div>
              </div>

              <p className="text-sm italic text-slate-600 leading-relaxed flex-grow">
                &ldquo;{reviewText}&rdquo;
              </p>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-700 transition-all cursor-pointer"
                  onClick={() => openForm(test, idx)}
                >
                  <Edit2 size={12} /> Edit
                </button>
                <button
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                  onClick={() => handleDelete(idx)}
                >
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`${editingItem !== null ? 'Edit' : 'Create'} ${isVideo ? 'Student Testimonial' : 'Recruiter Quote'}`}
      >
        <form onSubmit={handleFormSubmit}>
          <div className="p-6 flex flex-col gap-4">
            {isVideo ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SearchableSelect
                    label="Student (placed)"
                    placeholder="Search by name, role, or company..."
                    options={studentSelectOptions}
                    value={formData.studentName || ''}
                    onChange={handlePlacedStudentChange}
                    required
                    emptyMessage={
                      studentSelectOptions.length
                        ? 'No students match your search.'
                        : 'No placed students — add them under Students → Placed'
                    }
                  />
                  {/* <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</label>
                    <input className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-slate-700" required value={formData.role || ''} onChange={e => setFormData({ ...formData, role: e.target.value })} />
                  </div> */}
                </div>
                {/* {companySelect} */}
                <ImageUploadField 
                  label="Avatar Image" 
                  value={formData.avatar} 
                  onChange={val => setFormData({ ...formData, avatar: val })} 
                />
                <div className="flex flex-col gap-1.5">
                  <label className="admin-label">Review</label>
                  <textarea
                    className="admin-input"
                    required
                    rows={4}
                    placeholder="Share the student's experience at NSR Academy..."
                    value={formData.review || ''}
                    onChange={(e) => setFormData({ ...formData, review: e.target.value })}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</label>
                  <input className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-slate-700" required value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</label>
                  <input className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-slate-700" required value={formData.role || ''} onChange={e => setFormData({ ...formData, role: e.target.value })} />
                </div>
                {companySelect}
                <ImageUploadField 
                  label="Avatar Image" 
                  value={formData.avatar} 
                  onChange={val => setFormData({ ...formData, avatar: val })} 
                />
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Quote</label>
                  <textarea className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-slate-700" required rows={4} value={formData.quote || ''} onChange={e => setFormData({ ...formData, quote: e.target.value })} />
                </div>
              </>
            )}
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
