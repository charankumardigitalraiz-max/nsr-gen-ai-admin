import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, size = 'default' }) {
  if (!isOpen) return null;

  const sizeClass = size === 'large' ? 'admin-modal-large' : '';

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className={`admin-modal ${sizeClass}`} onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3 className="text-base font-bold text-[#1b4332]">{title}</h3>
          <button
            type="button"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer border-none bg-transparent"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
