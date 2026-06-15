import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, Loader2 } from 'lucide-react';
import Modal from '../components/Modal';
import ImageUploadField from '../components/ImageUploadField';
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

const EMPTY_STAFF = {
  name: '',
  role: '',
  credentials: '',
  bgClass: 'from-[#00a86b]/10 to-[#00a86b]/20',
  avatar: '',
  companies: [],
};

function normalizeStaffForm(formData) {
  const clean = { ...formData };
  if (typeof clean.companies === 'string') {
    clean.companies = clean.companies.split(',').map((s) => s.trim()).filter(Boolean);
  }
  return clean;
}

export default function Staff({ showToast, refreshStats }) {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_STAFF);
  const [pendingAvatar, setPendingAvatar] = useState(null);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const data = await fetchResource(RESOURCE_KEYS.staff);
      setStaffList(data);
    } catch (err) {
      showToast(err.message || 'Error loading staff', 'error');
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setPendingAvatar(null);
  };

  const openForm = (item = null) => {
    setEditingId(item?.id ?? null);
    setFormData(item ? { ...item } : { ...EMPTY_STAFF });
    setPendingAvatar(null);
    setModalOpen(true);
  };

  const handleDelete = async (member) => {
    if (!member?.id) {
      showToast('Refresh the page and try again.', 'error');
      return;
    }
    if (!window.confirm(`Remove ${member.name} from staff?`)) return;

    try {
      await deleteResourceItem(RESOURCE_KEYS.staff, member.id);
      showToast('Staff member removed');
      fetchStaff();
      refreshStats();
    } catch (error) {
      showToast(error.message || 'Failed to delete', 'error');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = normalizeStaffForm(formData);
      if (pendingAvatar) {
        payload.avatar = await apiUpload(pendingAvatar);
      }

      if (editingId) {
        await updateResourceItem(RESOURCE_KEYS.staff, editingId, payload);
        showToast('Staff member updated!');
      } else {
        await createResourceItem(RESOURCE_KEYS.staff, payload);
        showToast('Staff member added!');
      }

      closeModal();
      fetchStaff();
      refreshStats();
    } catch (error) {
      showToast(error.message || 'Failed to save', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading staff..." />;
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Staff & Faculty"
        subtitle="Manage team members shown on the website (founders, mentors, trainers)."
        action={
          <button type="button" className="admin-btn-primary" onClick={() => openForm()}>
            <Plus size={16} /> Add Staff
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {staffList.map((member) => (
          <div key={member.id || member.name} className="admin-item-card p-5">
            <div className="flex items-center gap-4">
              {member.avatar ? (
                <img
                  src={resolveUploadUrl(member.avatar)}
                  alt={member.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-[#00a86b]/20"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-[#f1f8f4] flex items-center justify-center text-xl font-bold text-[#1b4332]">
                  {member.name?.charAt(0) || '?'}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold text-[#1b4332] truncate">{member.name}</h3>
                <p className="text-xs text-[#00a86b] font-semibold">{member.role}</p>
                <p className="text-[11px] text-slate-500 mt-0.5 truncate">{member.credentials}</p>
              </div>
            </div>
            {Array.isArray(member.companies) && member.companies.length > 0 && (
              <p className="text-[11px] text-slate-400 mt-3">{member.companies.join(' · ')}</p>
            )}
            <div className="admin-item-card-footer !border-t-0 !bg-transparent !p-0 mt-4">
              <button type="button" className="admin-btn-secondary !text-[11px] !py-1.5" onClick={() => openForm(member)}>
                <Edit2 size={11} /> Edit
              </button>
              <button type="button" className="admin-btn-danger !text-[11px] !py-1.5" onClick={() => handleDelete(member)}>
                <Trash2 size={11} /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={modalOpen} onClose={closeModal} title={`${editingId ? 'Edit' : 'Add'} Staff Member`}>
        <form onSubmit={handleFormSubmit}>
          <div className="p-6 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="admin-label">Full name</label>
              <input className="admin-input" required value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="admin-label">Role</label>
                <input className="admin-input" placeholder="Founder, Mentor..." required value={formData.role || ''} onChange={(e) => setFormData({ ...formData, role: e.target.value })} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="admin-label">Credentials</label>
                <input className="admin-input" placeholder="Ex-Oracle, Amazon" value={formData.credentials || ''} onChange={(e) => setFormData({ ...formData, credentials: e.target.value })} />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="admin-label">Companies (comma separated)</label>
              <input className="admin-input" placeholder="Oracle, Amazon" value={Array.isArray(formData.companies) ? formData.companies.join(', ') : formData.companies || ''} onChange={(e) => setFormData({ ...formData, companies: e.target.value })} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="admin-label">Card background (Tailwind gradient)</label>
              <input className="admin-input" placeholder="from-[#00a86b]/10 to-[#00a86b]/20" value={formData.bgClass || ''} onChange={(e) => setFormData({ ...formData, bgClass: e.target.value })} />
            </div>
            <ImageUploadField
              label="Profile photo"
              deferUpload
              value={formData.avatar}
              pendingFile={pendingAvatar}
              onPendingFile={setPendingAvatar}
              onChange={(val) => setFormData({ ...formData, avatar: val })}
            />
          </div>
          <div className="admin-modal-footer">
            <button type="button" className="admin-btn-secondary" onClick={closeModal} disabled={saving}>Cancel</button>
            <button type="submit" className="admin-btn-primary" disabled={saving}>
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
