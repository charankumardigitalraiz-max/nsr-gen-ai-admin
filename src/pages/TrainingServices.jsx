import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Save } from 'lucide-react';
import Modal from '../components/Modal';
import ImageUploadField from '../components/ImageUploadField';
import PageHeader from '../components/PageHeader';
import LoadingState from '../components/LoadingState';
import { fetchResource, saveResource, RESOURCE_KEYS } from '../services/api';
import { resolveUploadUrl } from '../lib/api';

const ICON_OPTIONS = [
  'classroom',
  'project',
  'workshop',
  'corporate',
  'interview',
  'placement',
  'weekend',
  'mentor',
];

const ACCENT_OPTIONS = ['gh-blue', 'gh-purple', 'cyber-pink', 'gh-green'];

const EMPTY_SERVICE = {
  icon: 'classroom',
  title: '',
  desc: '',
  tag: '',
  accent: 'gh-blue',
  image: '',
  imageAlt: '',
};

export default function TrainingServices({ showToast, refreshStats }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState(EMPTY_SERVICE);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    setLoading(true);
    try {
      const data = await fetchResource(RESOURCE_KEYS.training);
      setServices(data);
    } catch (err) {
      showToast(err.message || 'Error loading training services', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (updatedList, successMsg) => {
    try {
      await saveResource(RESOURCE_KEYS.training, updatedList);
      showToast(successMsg || 'Saved successfully');
      await loadServices();
      refreshStats();
      setModalOpen(false);
    } catch (err) {
      showToast(err.message || 'Could not save', 'error');
    }
  };

  const handleDelete = (index) => {
    if (!window.confirm('Delete this training service?')) return;
    const updated = [...services];
    updated.splice(index, 1);
    handleSave(updated, 'Training service deleted');
  };

  const openForm = (item = null, index = null) => {
    setEditingItem(index);
    setFormData(item ? { ...item } : { ...EMPTY_SERVICE });
    setModalOpen(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const updated = [...services];
    if (editingItem !== null) {
      updated[editingItem] = formData;
    } else {
      updated.push(formData);
    }
    handleSave(updated, 'Training service saved');
  };

  if (loading) {
    return <LoadingState message="Loading training services..." />;
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Training Services"
        subtitle="Service cards and images shown on the training section of the website."
        action={
          <button type="button" className="admin-btn-primary" onClick={() => openForm()}>
            <Plus size={16} /> Add Service
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {services.map((service, idx) => (
          <div key={service.id || idx} className="admin-item-card overflow-hidden">
            <div className="aspect-[16/10] bg-slate-100">
              {service.image ? (
                <img
                  src={resolveUploadUrl(service.image)}
                  alt={service.imageAlt || service.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-xs text-slate-400">
                  No image
                </div>
              )}
            </div>
            <div className="p-4 flex flex-col gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#00a86b]">
                {service.tag || 'Service'}
              </span>
              <h3 className="text-sm font-bold text-[#1b4332] m-0">{service.title}</h3>
              <p className="text-xs text-slate-500 line-clamp-2 m-0">{service.desc}</p>
              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <button type="button" className="admin-btn-secondary !text-xs" onClick={() => openForm(service, idx)}>
                  <Edit2 size={12} /> Edit
                </button>
                <button type="button" className="admin-btn-danger !text-xs" onClick={() => handleDelete(idx)}>
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`${editingItem !== null ? 'Edit' : 'Add'} Training Service`}
      >
        <form onSubmit={handleFormSubmit}>
          <div className="p-6 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="admin-label">Icon key</label>
                <select
                  className="admin-input"
                  value={formData.icon || 'classroom'}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                >
                  {ICON_OPTIONS.map((icon) => (
                    <option key={icon} value={icon}>{icon}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="admin-label">Accent</label>
                <select
                  className="admin-input"
                  value={formData.accent || 'gh-blue'}
                  onChange={(e) => setFormData({ ...formData, accent: e.target.value })}
                >
                  {ACCENT_OPTIONS.map((accent) => (
                    <option key={accent} value={accent}>{accent}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="admin-label">Title</label>
              <input className="admin-input" required value={formData.title || ''} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="admin-label">Tag</label>
              <input className="admin-input" required value={formData.tag || ''} onChange={(e) => setFormData({ ...formData, tag: e.target.value })} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="admin-label">Description</label>
              <textarea className="admin-input" required rows={3} value={formData.desc || ''} onChange={(e) => setFormData({ ...formData, desc: e.target.value })} />
            </div>

            <ImageUploadField
              label="Service image"
              value={formData.image}
              onChange={(val) => setFormData({ ...formData, image: val })}
            />

            <div className="flex flex-col gap-1.5">
              <label className="admin-label">Image alt text</label>
              <input className="admin-input" value={formData.imageAlt || ''} onChange={(e) => setFormData({ ...formData, imageAlt: e.target.value })} />
            </div>
          </div>

          <div className="p-6 border-t border-slate-200/80 flex justify-end gap-3 bg-slate-50/50">
            <button type="button" className="admin-btn-secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="admin-btn-primary">
              <Save size={16} /> Save
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
