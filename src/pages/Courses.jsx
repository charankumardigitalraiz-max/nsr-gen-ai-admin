import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, Loader2 } from 'lucide-react';
import Modal from '../components/Modal';
import ImageUploadField from '../components/ImageUploadField';
import DynamicListField from '../components/DynamicListField';
import ConceptGroupsField, { normalizeConceptsForForm } from '../components/ConceptGroupsField';
import WhoForField from '../components/WhoForField';
import PageHeader from '../components/PageHeader';
import LoadingState from '../components/LoadingState';

import {
  fetchResource,
  createResourceItem,
  updateResourceItem,
  deleteResourceItem,
  RESOURCE_KEYS,
} from '../services/api';
import { apiUpload, resolveUploadUrl } from '../lib/api';

const EMPTY_COURSE = {
  slug: '',
  icon: '',
  title: '',
  tagline: '',
  shortDesc: '',
  duration: '',
  level: '',
  mode: 'Classroom · KPHB, Hyderabad',
  batchLabel: 'June batch',
  description: '',
  color: 'from-blue-500/20 to-cyan-500/10',
  accent: 'gh-blue',
  modules: [],
  skills: [],
  tools: [],
  outcomes: [],
  concepts: [],
  whoFor: [],
  logoAlt: '',
};

function cleanStringList(list) {
  if (!Array.isArray(list)) return [];
  return list.map((s) => String(s).trim()).filter(Boolean);
}

function cleanConcepts(concepts) {
  if (!Array.isArray(concepts)) return [];
  return concepts
    .map((g) => ({
      title: String(g?.title || '').trim(),
      topics: cleanStringList(g?.topics),
    }))
    .filter((g) => g.title && g.topics.length > 0);
}

function cleanWhoFor(whoFor) {
  if (!Array.isArray(whoFor)) return [];
  return whoFor
    .map((item) => ({
      question: String(item?.question || '').trim(),
      points: cleanStringList(item?.points),
    }))
    .filter((item) => item.question && item.points.length > 0);
}

function previewSlug(title) {
  if (!title?.trim()) return '';
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function validateCoursePayload(payload, pendingFiles) {
  const missing = [];

  if (!payload.title?.trim()) missing.push('Title');
  if (!payload.tagline?.trim()) missing.push('Tagline');
  if (!payload.shortDesc?.trim()) missing.push('Short description');
  if (!payload.duration?.trim()) missing.push('Duration');
  if (!payload.level?.trim()) missing.push('Level');
  if (!payload.mode?.trim()) missing.push('Mode / Location');
  if (!payload.description?.trim()) missing.push('About this program');
  if (!payload.image && !pendingFiles.image) missing.push('Hero / poster image');

  return missing;
}

function normalizeCourseForm(formData) {
  const clean = { ...formData };

  clean.modules = cleanStringList(
    typeof clean.modules === 'string'
      ? clean.modules.split('\n')
      : clean.modules,
  );
  clean.skills = cleanStringList(
    typeof clean.skills === 'string' ? clean.skills.split(',') : clean.skills,
  );
  clean.tools = cleanStringList(
    typeof clean.tools === 'string' ? clean.tools.split(',') : clean.tools,
  );
  clean.outcomes = cleanStringList(
    typeof clean.outcomes === 'string' ? clean.outcomes.split('\n') : clean.outcomes,
  );
  clean.concepts = cleanConcepts(clean.concepts);
  clean.whoFor = cleanWhoFor(clean.whoFor);

  if (!clean.slug?.trim() && clean.title) {
    clean.slug = clean.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  return clean;
}

export default function Courses({ showToast, refreshStats }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_COURSE);
  const [pendingFiles, setPendingFiles] = useState({ image: null, logo: null });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const data = await fetchResource(RESOURCE_KEYS.courses);
      setCourses(data);
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Error loading courses', 'error');
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setPendingFiles({ image: null, logo: null });
  };

  const openForm = (item = null) => {
    setEditingId(item?.id ?? null);
    if (item) {
      setFormData({
        ...EMPTY_COURSE,
        ...item,
        concepts: normalizeConceptsForForm(item.concepts),
        whoFor: Array.isArray(item.whoFor) ? item.whoFor.map((entry) => ({
          question: entry?.question || '',
          points: Array.isArray(entry.points) && entry.points.length > 0 ? [...entry.points] : [''],
        })) : [],
        modules: Array.isArray(item.modules) ? [...item.modules] : [],
        skills: Array.isArray(item.skills) ? [...item.skills] : [],
        tools: Array.isArray(item.tools) ? [...item.tools] : [],
        outcomes: Array.isArray(item.outcomes) ? [...item.outcomes] : [],
      });
    } else {
      setFormData({ ...EMPTY_COURSE });
    }
    setPendingFiles({ image: null, logo: null });
    setModalOpen(true);
  };

  const handleDelete = async (course) => {
    if (!course?.id) {
      showToast('This course has no ID. Refresh the page and try again.', 'error');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this course?')) return;

    try {
      await deleteResourceItem(RESOURCE_KEYS.courses, course.id);
      showToast('Course deleted successfully');
      fetchCourses();
      refreshStats();
    } catch (error) {
      showToast(error.message || 'Failed to delete course', 'error');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = normalizeCourseForm(formData);
      const missing = validateCoursePayload(payload, pendingFiles);

      if (missing.length > 0) {
        showToast(`Please fill required fields: ${missing.join(', ')}`, 'error');
        setSaving(false);
        return;
      }

      if (pendingFiles.image) {
        payload.image = await apiUpload(pendingFiles.image);
      }
      if (pendingFiles.logo) {
        payload.logo = await apiUpload(pendingFiles.logo);
      }

      if (editingId) {
        await updateResourceItem(RESOURCE_KEYS.courses, editingId, payload);
        showToast('Course updated successfully!');
      } else {
        await createResourceItem(RESOURCE_KEYS.courses, payload);
        showToast('Course created successfully!');
      }

      closeModal();
      fetchCourses();
      refreshStats();
    } catch (error) {
      showToast(error.message || 'Failed to save course', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading courses..." />;
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Courses"
        subtitle="Manage curriculums, durations, tools, and outcomes."
        action={
          <button type="button" className="admin-btn-primary" onClick={() => openForm()}>
            <Plus size={16} /> Add Course
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {courses.map((course) => (
          <div key={course.id || course.slug} className="admin-item-card">
            {course.image && (
              <img
                src={resolveUploadUrl(course.image)}
                alt={course.title}
                className="h-32 w-full object-cover bg-slate-100"
              />
            )}
            <div className="p-4 flex flex-col gap-2 flex-grow">
              <div className="flex justify-between items-center">
                <span className="px-2 py-0.5 bg-[#00a86b]/10 text-[#1b4332] rounded-full text-[10px] font-bold uppercase tracking-wider">
                  {course.duration}
                </span>
                <span className="text-base">{course.icon}</span>
              </div>
              <h3 className="text-sm font-bold text-[#1b4332] leading-snug">{course.title}</h3>
              <p className="text-xs text-slate-500 line-clamp-2">{course.tagline}</p>
              <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400 mt-1">
                <span>{course.level}</span>
                <span>•</span>
                <span>{course.mode?.split('·')[0]?.trim()}</span>
              </div>
            </div>
            <div className="admin-item-card-footer">
              <button type="button" className="admin-btn-secondary !text-[11px] !py-1.5" onClick={() => openForm(course)}>
                <Edit2 size={11} /> Edit
              </button>
              <button type="button" className="admin-btn-danger !text-[11px] !py-1.5" onClick={() => handleDelete(course)}>
                <Trash2 size={11} /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={`${editingId ? 'Edit' : 'Create'} Course`}
        size="large"
      >
        <form onSubmit={handleFormSubmit}>
          <div className="p-6 flex flex-col gap-5">
            <p className="admin-form-section">Basic info (hero & listing)</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="admin-label">Title <span className="text-rose-500">*</span></label>
                <input className="admin-input" required value={formData.title || ''} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
              </div>

              {/* <div className="flex flex-col gap-1.5">
                <label className="admin-label">URL slug</label>
                <input
                  className="admin-input"
                  placeholder="data-analyst-with-genai"
                  value={formData.slug || ''}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                />
                <p className="text-[11px] text-slate-400">
                  {formData.slug?.trim()
                    ? `/courses/${formData.slug.trim()}`
                    : previewSlug(formData.title)
                      ? `Auto: /courses/${previewSlug(formData.title)}`
                      : 'Auto-generated from title if left empty'}
                </p>
              </div> */}
              {/* <div className="flex flex-col gap-1.5">
                <label className="admin-label">Icon (emoji)</label>
                <input className="admin-input" placeholder="📊" value={formData.icon || ''} onChange={(e) => setFormData({ ...formData, icon: e.target.value })} />
                <p className="text-[11px] text-slate-400">Shown in course detail hero badge</p>
              </div> */}

              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="admin-label">Tagline <span className="text-rose-500">*</span></label>
                <input className="admin-input" required value={formData.tagline || ''} onChange={(e) => setFormData({ ...formData, tagline: e.target.value })} />
              </div>
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="admin-label">Short description (courses listing card) <span className="text-rose-500">*</span></label>
                <input className="admin-input" required value={formData.shortDesc || ''} onChange={(e) => setFormData({ ...formData, shortDesc: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="admin-label">Duration <span className="text-rose-500">*</span></label>
                <input className="admin-input" required placeholder="4–5 Months" value={formData.duration || ''} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="admin-label">Level <span className="text-rose-500">*</span></label>
                <input className="admin-input" required placeholder="Beginner Friendly" value={formData.level || ''} onChange={(e) => setFormData({ ...formData, level: e.target.value })} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="admin-label">Mode / Location <span className="text-rose-500">*</span></label>
                <input className="admin-input" required value={formData.mode || ''} onChange={(e) => setFormData({ ...formData, mode: e.target.value })} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="admin-label">Batch label</label>
                <input className="admin-input" placeholder="June batch" value={formData.batchLabel || ''} onChange={(e) => setFormData({ ...formData, batchLabel: e.target.value })} />
              </div>
            </div>

            {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="admin-label">Card color (Tailwind gradient)</label>
                <input className="admin-input" placeholder="from-blue-500/20 to-cyan-500/10" value={formData.color || ''} onChange={(e) => setFormData({ ...formData, color: e.target.value })} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="admin-label">Accent theme</label>
                <select className="admin-input" value={formData.accent || 'gh-blue'} onChange={(e) => setFormData({ ...formData, accent: e.target.value })}>
                  <option value="gh-blue">gh-blue</option>
                  <option value="gh-purple">gh-purple</option>
                  <option value="emerald">emerald</option>
                </select>
              </div>
            </div> */}

            <p className="admin-form-section">Detail page content</p>

            <div className="flex flex-col gap-1.5">
              <label className="admin-label">About this program (description) <span className="text-rose-500">*</span></label>
              <textarea className="admin-input" required rows={4} value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="admin-label">Skills tags (comma separated)</label>
              <input className="admin-input" value={Array.isArray(formData.skills) ? formData.skills.join(', ') : formData.skills || ''} onChange={(e) => setFormData({ ...formData, skills: e.target.value })} />
            </div>

            <ConceptGroupsField
              label="Concepts covered (accordion)"
              values={formData.concepts}
              onChange={(val) => setFormData({ ...formData, concepts: val })}
            />

            <WhoForField
              label="Who should join (FAQ)"
              values={formData.whoFor}
              onChange={(val) => setFormData({ ...formData, whoFor: val })}
            />

            <p className="admin-form-section">Extra curriculum (optional)</p>

            <DynamicListField
              label="Modules"
              values={formData.modules}
              onChange={(val) => setFormData({ ...formData, modules: val })}
              placeholder="e.g. Python fundamentals for data analysis"
            />
            <div className="flex flex-col gap-1.5">
              <label className="admin-label">Tools (comma separated)</label>
              <input className="admin-input" value={Array.isArray(formData.tools) ? formData.tools.join(', ') : formData.tools || ''} onChange={(e) => setFormData({ ...formData, tools: e.target.value })} />
            </div>
            <DynamicListField
              label="Career outcomes"
              values={formData.outcomes}
              onChange={(val) => setFormData({ ...formData, outcomes: val })}
              placeholder="e.g. Answer SQL & Python interview questions confidently"
            />

            <p className="admin-form-section">Images</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ImageUploadField
                label="Hero / poster image *"
                deferUpload
                value={formData.image}
                pendingFile={pendingFiles.image}
                onPendingFile={(file) => setPendingFiles((p) => ({ ...p, image: file }))}
                onChange={(val) => setFormData({ ...formData, image: val })}
              />
              <ImageUploadField
                label="Course logo"
                deferUpload
                value={formData.logo}
                pendingFile={pendingFiles.logo}
                onPendingFile={(file) => setPendingFiles((p) => ({ ...p, logo: file }))}
                onChange={(val) => setFormData({ ...formData, logo: val })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="admin-label">Logo alt text</label>
              <input className="admin-input" placeholder="Power BI" value={formData.logoAlt || ''} onChange={(e) => setFormData({ ...formData, logoAlt: e.target.value })} />
            </div>
          </div>

          <div className="admin-modal-footer">
            <button type="button" className="admin-btn-secondary" onClick={closeModal} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="admin-btn-primary" disabled={saving}>
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
