import React, { useState } from 'react';
import { Save, Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import Modal from './Modal';
import { apiUpload, resolveUploadUrl } from '../lib/api';

function ImageUploadField({ label, value, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      const url = await apiUpload(file);
      onChange(url);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const previewUrl = resolveUploadUrl(value);

  return (
    <div className="flex flex-col gap-1.5 border border-slate-100 rounded-xl p-3.5 bg-slate-50/50">
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</label>
      
      <div className="flex gap-4 items-center">
        <div className="w-14 h-14 rounded-lg border border-slate-200 bg-white flex items-center justify-center overflow-hidden flex-shrink-0">
          {previewUrl ? (
            <img src={previewUrl} alt={label} className="w-full h-full object-cover" />
          ) : (
            <ImageIcon className="text-slate-400" size={20} />
          )}
        </div>

        <div className="flex-1 flex flex-col gap-1.5">
          <div className="flex gap-2">
            <input 
              type="text" 
              className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg bg-white text-xs outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-slate-700"
              placeholder="Paste path/URL, e.g. /uploads/image.png"
              value={value || ''} 
              onChange={e => onChange(e.target.value)} 
            />
            
            <label className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer transition-all shadow-sm flex-shrink-0 select-none">
              {uploading ? (
                <Loader2 size={14} className="animate-spin text-emerald-600" />
              ) : (
                <Upload size={14} className="text-slate-500" />
              )}
              <span>{uploading ? 'Uploading...' : 'Choose File'}</span>
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                disabled={uploading}
                onChange={handleFileChange} 
              />
            </label>
          </div>
          {error && <span className="text-[10px] text-red-500 font-medium">{error}</span>}
        </div>
      </div>
    </div>
  );
}


export default function EditorModal({ 
  modalOpen, 
  setModalOpen, 
  editType, 
  editingItem, 
  formData, 
  setFormData, 
  courses, 
  handleFormSubmit 
}) {
  return (
    <Modal
      isOpen={modalOpen}
      onClose={() => setModalOpen(false)}
      title={`${editingItem !== null ? 'Edit' : 'Create'} ${editType ? editType.charAt(0).toUpperCase() + editType.slice(1) : ''}`}
    >
      <form onSubmit={handleFormSubmit}>
          <div className="p-6 flex flex-col gap-4">
            {/* Course Form */}
            {editType === 'course' && (
              <>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Title</label>
                  <input className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all" required value={formData.title || ''} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Slug (unique URL path)</label>
                  <input className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all" required value={formData.slug || ''} onChange={e => setFormData({ ...formData, slug: e.target.value })} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tagline</label>
                  <input className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all" value={formData.tagline || ''} onChange={e => setFormData({ ...formData, tagline: e.target.value })} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Duration</label>
                  <input className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all" value={formData.duration || ''} onChange={e => setFormData({ ...formData, duration: e.target.value })} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Level</label>
                  <input className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all" value={formData.level || ''} onChange={e => setFormData({ ...formData, level: e.target.value })} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Mode</label>
                  <input className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all" value={formData.mode || ''} onChange={e => setFormData({ ...formData, mode: e.target.value })} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</label>
                  <textarea className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all" rows={4} value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Skills (comma separated)</label>
                  <input className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all" value={Array.isArray(formData.skills) ? formData.skills.join(', ') : formData.skills || ''} onChange={e => setFormData({ ...formData, skills: e.target.value })} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tools (comma separated)</label>
                  <input className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all" value={Array.isArray(formData.tools) ? formData.tools.join(', ') : formData.tools || ''} onChange={e => setFormData({ ...formData, tools: e.target.value })} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Modules (one per line)</label>
                  <textarea className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all" rows={4} value={Array.isArray(formData.modules) ? formData.modules.join('\n') : formData.modules || ''} onChange={e => setFormData({ ...formData, modules: e.target.value })} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Outcomes (one per line)</label>
                  <textarea className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all" rows={4} value={Array.isArray(formData.outcomes) ? formData.outcomes.join('\n') : formData.outcomes || ''} onChange={e => setFormData({ ...formData, outcomes: e.target.value })} />
                </div>
                <ImageUploadField 
                  label="Poster Image" 
                  value={formData.image} 
                  onChange={val => setFormData({ ...formData, image: val })} 
                />
                <ImageUploadField 
                  label="Course Logo" 
                  value={formData.logo} 
                  onChange={val => setFormData({ ...formData, logo: val })} 
                />
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Logo Alt Text (e.g. Power BI)</label>
                  <input className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all" value={formData.logoAlt || ''} onChange={e => setFormData({ ...formData, logoAlt: e.target.value })} />
                </div>
              </>
            )}

            {/* Placement Form */}
            {editType === 'placement' && (
              <>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Student Name</label>
                  <input className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all" required value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Course</label>
                  <select className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all" required value={formData.courseSlug || ''} onChange={e => setFormData({ ...formData, courseSlug: e.target.value })}>
                    <option value="">Select Course</option>
                    {courses.map(c => (
                      <option key={c.slug} value={c.slug}>{c.title}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</label>
                  <input className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all" value={formData.role || ''} onChange={e => setFormData({ ...formData, role: e.target.value })} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Hired Company</label>
                  <input className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all" required value={formData.company || ''} onChange={e => setFormData({ ...formData, company: e.target.value })} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Salary Package (e.g., 12 LPA)</label>
                  <input className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all" required value={formData.package || ''} onChange={e => setFormData({ ...formData, package: e.target.value })} />
                </div>
                <ImageUploadField 
                  label="Student Photo / Avatar" 
                  value={formData.image} 
                  onChange={val => setFormData({ ...formData, image: val })} 
                />
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tags (comma separated)</label>
                  <input className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all" value={Array.isArray(formData.tags) ? formData.tags.join(', ') : formData.tags || ''} onChange={e => setFormData({ ...formData, tags: e.target.value })} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Quote</label>
                  <textarea className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all" rows={3} value={formData.quote || ''} onChange={e => setFormData({ ...formData, quote: e.target.value })} />
                </div>
              </>
            )}

            {/* Recruiter Quote Form */}
            {editType === 'recruiter' && (
              <>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</label>
                  <input className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all" required value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</label>
                  <input className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all" required value={formData.role || ''} onChange={e => setFormData({ ...formData, role: e.target.value })} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Company</label>
                  <input className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all" required value={formData.company || ''} onChange={e => setFormData({ ...formData, company: e.target.value })} />
                </div>
                <ImageUploadField 
                  label="Avatar Image" 
                  value={formData.avatar} 
                  onChange={val => setFormData({ ...formData, avatar: val })} 
                />
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Quote</label>
                  <textarea className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all" required rows={4} value={formData.quote || ''} onChange={e => setFormData({ ...formData, quote: e.target.value })} />
                </div>
              </>
            )}

            {/* Video Review Form */}
            {editType === 'video' && (
              <>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Student Name</label>
                  <input className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all" required value={formData.studentName || ''} onChange={e => setFormData({ ...formData, studentName: e.target.value })} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</label>
                  <input className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all" required value={formData.role || ''} onChange={e => setFormData({ ...formData, role: e.target.value })} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Company</label>
                  <input className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all" required value={formData.company || ''} onChange={e => setFormData({ ...formData, company: e.target.value })} />
                </div>
                <ImageUploadField 
                  label="Avatar Image" 
                  value={formData.avatar} 
                  onChange={val => setFormData({ ...formData, avatar: val })} 
                />
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Video URL (mp4 or stream link)</label>
                  <input className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all" required value={formData.videoUrl || ''} onChange={e => setFormData({ ...formData, videoUrl: e.target.value })} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Quote</label>
                  <textarea className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all" required rows={3} value={formData.quote || ''} onChange={e => setFormData({ ...formData, quote: e.target.value })} />
                </div>
              </>
            )}

            {/* Partner Form */}
            {editType === 'partner' && (
              <>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Company Name</label>
                  <input className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all" required value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <ImageUploadField 
                  label="Partner Logo" 
                  value={formData.logo} 
                  onChange={val => setFormData({ ...formData, logo: val })} 
                />
                {/* <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tailwind hover style (e.g. hover:border-[#0033A0]/30)</label>
                  <input className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all" value={formData.color || ''} onChange={e => setFormData({ ...formData, color: e.target.value })} />
                </div> */}
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
  );
}
