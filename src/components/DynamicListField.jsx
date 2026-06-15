import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

export default function DynamicListField({ label, values, onChange, placeholder = "Enter item text..." }) {
  const list = Array.isArray(values) ? values : [];
  
  const handleItemChange = (index, value) => {
    const updated = [...list];
    updated[index] = value;
    onChange(updated);
  };

  const handleAddItem = () => {
    onChange([...list, '']);
  };

  const handleRemoveItem = (index) => {
    const updated = [...list];
    updated.splice(index, 1);
    onChange(updated);
  };

  return (
    <div className="flex flex-col gap-2 border border-slate-100 rounded-xl p-3.5 bg-slate-50/50">
      <div className="flex justify-between items-center">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</label>
        <button
          type="button"
          onClick={handleAddItem}
          className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-500 cursor-pointer"
        >
          <Plus size={14} /> Add Item
        </button>
      </div>
      
      {list.length === 0 ? (
        <span className="text-xs text-slate-400 italic px-1">No items added yet. Click "Add Item" to start.</span>
      ) : (
        <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
          {list.map((item, index) => (
            <div key={index} className="flex gap-2 items-center">
              <input
                type="text"
                className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg bg-white text-xs outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-slate-700"
                placeholder={placeholder}
                value={item}
                onChange={e => handleItemChange(index, e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => handleRemoveItem(index)}
                className="text-slate-400 hover:text-rose-500 p-1.5 cursor-pointer transition-colors"
                title="Delete item"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
