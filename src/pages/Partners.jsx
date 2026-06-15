import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save } from 'lucide-react';
import Modal from '../components/Modal';
import ImageUploadField from '../components/ImageUploadField';
import PageHeader from '../components/PageHeader';
import LoadingState from '../components/LoadingState';

import { fetchResource, saveResource, RESOURCE_KEYS } from '../services/api';
import { resolveUploadUrl } from '../lib/api';

export default function Partners({ showToast, refreshStats }) {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    setLoading(true);
    try {
      const data = await fetchResource(RESOURCE_KEYS.partners);
      setPartners(data);
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Error loading partners list', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (updatedList, successMsg) => {
    try {
      await saveResource(RESOURCE_KEYS.partners, updatedList);
      showToast(successMsg || 'Saved successfully!');
      fetchPartners();
      refreshStats();
      setModalOpen(false);
    } catch (error) {
      showToast(error.message || 'Network error while saving', 'error');
    }
  };

  const handleDelete = (index) => {
    if (!window.confirm('Are you sure you want to delete this partner?')) return;
    const updated = [...partners];
    updated.splice(index, 1);
    handleSave(updated, 'Partner deleted successfully');
  };

  const openForm = (item = null, index = null) => {
    setEditingItem(index);
    setFormData(item ? { ...item } : { name: '', color: 'hover:border-[#00a86b]/30', logo: '' });
    setModalOpen(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const cleanFormData = { ...formData };
    const updated = [...partners];
    if (editingItem !== null) {
      updated[editingItem] = cleanFormData;
    } else {
      updated.push(cleanFormData);
    }
    handleSave(updated, 'Partner saved successfully!');
  };

  if (loading) {
    return <LoadingState message="Loading partners..." />;
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Hiring Partners"
        subtitle="Brands and companies hiring from NSR ProSkills pools."
        action={
          <button type="button" className="admin-btn-primary" onClick={() => openForm()}>
            <Plus size={16} /> Add Partner
          </button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {partners.map((partner, idx) => (
          <div key={idx} className="admin-item-card p-5 items-center text-center gap-3">
            <div className="h-16 w-full flex items-center justify-center bg-[#f1f8f4] rounded-lg p-2 border border-[#1b4332]/8">
              {partner.logo ? (
                <img
                  src={resolveUploadUrl(partner.logo)}
                  alt={partner.name}
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <div className="text-sm font-bold text-[#1b4332]">{partner.name}</div>
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1b4332]">{partner.name}</h3>
            </div>
            <div className="flex gap-2 pt-2 border-t border-slate-100 w-full justify-center">
              <button type="button" className="admin-btn-secondary !text-xs" onClick={() => openForm(partner, idx)}>
                <Edit2 size={12} /> Edit
              </button>
              <button type="button" className="admin-btn-danger !text-xs" onClick={() => handleDelete(idx)}>
                <Trash2 size={12} /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`${editingItem !== null ? 'Edit' : 'Create'} Partner`}
      >
        <form onSubmit={handleFormSubmit}>
          <div className="p-6 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Company Name</label>
              <input className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-slate-700" required value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <ImageUploadField 
              label="Partner Logo" 
              value={formData.logo} 
              onChange={val => setFormData({ ...formData, logo: val })} 
            />
            {/* <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tailwind hover style (e.g. hover:border-[#0033A0]/30)</label>
              <input className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-slate-700" value={formData.color || ''} onChange={e => setFormData({ ...formData, color: e.target.value })} />
            </div> */}
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
