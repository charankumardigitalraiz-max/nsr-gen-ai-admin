import { Plus, Trash2 } from 'lucide-react';

const EMPTY_ITEM = { question: '', points: [''] };

export default function WhoForField({ label, values, onChange }) {
  const items = Array.isArray(values) && values.length > 0 ? values : [];

  const updateItem = (index, patch) => {
    const next = [...items];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  };

  const updatePoint = (itemIndex, pointIndex, value) => {
    const next = [...items];
    const points = [...(next[itemIndex].points || [])];
    points[pointIndex] = value;
    next[itemIndex] = { ...next[itemIndex], points };
    onChange(next);
  };

  const addItem = () => onChange([...items, { ...EMPTY_ITEM }]);

  const removeItem = (index) => {
    const next = [...items];
    next.splice(index, 1);
    onChange(next);
  };

  const addPoint = (itemIndex) => {
    const next = [...items];
    const points = [...(next[itemIndex].points || []), ''];
    next[itemIndex] = { ...next[itemIndex], points };
    onChange(next);
  };

  const removePoint = (itemIndex, pointIndex) => {
    const next = [...items];
    const points = [...(next[itemIndex].points || [])];
    points.splice(pointIndex, 1);
    next[itemIndex] = { ...next[itemIndex], points };
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-3 border border-slate-100 rounded-xl p-3.5 bg-slate-50/50">
      <div className="flex justify-between items-center gap-2">
        <div>
          <label className="admin-label">{label}</label>
          <p className="text-[11px] text-slate-400 mt-0.5">Shown as &quot;Who should join&quot; FAQ on the course detail page</p>
        </div>
        <button type="button" onClick={addItem} className="flex items-center gap-1 text-xs font-semibold text-[#00a86b] hover:text-[#1b4332] cursor-pointer shrink-0">
          <Plus size={14} /> Add FAQ
        </button>
      </div>

      {items.length === 0 ? (
        <span className="text-xs text-slate-400 italic">No FAQ items yet.</span>
      ) : (
        <div className="flex flex-col gap-3 max-h-80 overflow-y-auto pr-1">
          {items.map((item, ii) => (
            <div key={ii} className="rounded-lg border border-slate-200 bg-white p-3 flex flex-col gap-2">
              <div className="flex gap-2 items-start">
                <input
                  type="text"
                  className="admin-input !text-sm flex-1"
                  placeholder="Question e.g. Who is this course for?"
                  value={item.question || ''}
                  onChange={(e) => updateItem(ii, { question: e.target.value })}
                />
                <button type="button" onClick={() => removeItem(ii)} className="text-slate-400 hover:text-rose-500 p-2 cursor-pointer">
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="pl-2 flex flex-col gap-1.5 border-l-2 border-violet-200">
                {(item.points || []).map((point, pi) => (
                  <div key={pi} className="flex gap-2 items-center">
                    <input
                      type="text"
                      className="admin-input !text-xs flex-1 !py-1.5"
                      placeholder="Answer point"
                      value={point}
                      onChange={(e) => updatePoint(ii, pi, e.target.value)}
                    />
                    <button type="button" onClick={() => removePoint(ii, pi)} className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer">
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={() => addPoint(ii)} className="text-[11px] font-semibold text-[#00a86b] text-left cursor-pointer">
                  + Add answer point
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
