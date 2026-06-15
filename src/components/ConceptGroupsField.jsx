import { useEffect, useState } from 'react';
import { Plus, Trash2, ChevronDown, CheckCircle2 } from 'lucide-react';

const EMPTY_GROUP = { title: '', topics: [''] };

export function normalizeConceptsForForm(concepts) {
  if (!Array.isArray(concepts) || concepts.length === 0) return [];

  if (concepts[0]?.topics != null) {
    return concepts.map((group) => ({
      title: String(group?.title || '').trim(),
      topics:
        Array.isArray(group.topics) && group.topics.length > 0
          ? group.topics.map((t) => String(t).trim()).filter((t) => t !== '')
          : [''],
    }));
  }

  return concepts.map((item) => {
    const title = typeof item === 'string' ? item.trim() : String(item?.title || '').trim();
    return { title, topics: title ? [title] : [''] };
  });
}

export default function ConceptGroupsField({ label, values, onChange }) {
  const groups = Array.isArray(values) && values.length > 0 ? values : [];
  const [openGroups, setOpenGroups] = useState(() => new Set([0]));

  useEffect(() => {
    if (groups.length === 0) {
      setOpenGroups(new Set());
      return;
    }
    setOpenGroups((prev) => {
      if (prev.size === 0) return new Set([0]);
      const next = new Set();
      prev.forEach((i) => {
        if (i < groups.length) next.add(i);
      });
      if (next.size === 0) next.add(0);
      return next;
    });
  }, [groups.length]);

  const topicCount = groups.reduce(
    (sum, group) => sum + (group.topics || []).filter((t) => String(t).trim()).length,
    0,
  );

  const updateGroup = (index, patch) => {
    const next = [...groups];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  };

  const updateTopic = (groupIndex, topicIndex, value) => {
    const next = [...groups];
    const topics = [...(next[groupIndex].topics || [])];
    topics[topicIndex] = value;
    next[groupIndex] = { ...next[groupIndex], topics };
    onChange(next);
  };

  const addGroup = () => {
    const nextIndex = groups.length;
    onChange([...groups, { ...EMPTY_GROUP }]);
    setOpenGroups((prev) => new Set([...prev, nextIndex]));
  };

  const removeGroup = (index) => {
    const next = [...groups];
    next.splice(index, 1);
    onChange(next);
    setOpenGroups((prev) => {
      const updated = new Set();
      prev.forEach((i) => {
        if (i < index) updated.add(i);
        else if (i > index) updated.add(i - 1);
      });
      return updated;
    });
  };

  const addTopic = (groupIndex) => {
    const next = [...groups];
    const topics = [...(next[groupIndex].topics || []), ''];
    next[groupIndex] = { ...next[groupIndex], topics };
    onChange(next);
    setOpenGroups((prev) => new Set([...prev, groupIndex]));
  };

  const removeTopic = (groupIndex, topicIndex) => {
    const next = [...groups];
    const topics = [...(next[groupIndex].topics || [])];
    topics.splice(topicIndex, 1);
    next[groupIndex] = { ...next[groupIndex], topics: topics.length > 0 ? topics : [''] };
    onChange(next);
  };

  const toggleGroup = (index) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-3 border border-slate-100 rounded-xl p-3.5 bg-slate-50/50">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <label className="admin-label">{label}</label>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Accordion groups shown as &quot;Concepts covered&quot; on the course detail page
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {groups.length > 0 && (
            <span className="rounded-full border border-[#00a86b]/20 bg-[#f1f8f4] px-2.5 py-1 text-[10px] font-bold text-[#00a86b]">
              {topicCount} sub-topics
            </span>
          )}
          <button
            type="button"
            onClick={addGroup}
            className="flex items-center gap-1 text-xs font-semibold text-[#00a86b] hover:text-[#1b4332] cursor-pointer"
          >
            <Plus size={14} /> Add group
          </button>
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200 bg-white px-4 py-8 text-center">
          <p className="text-xs text-slate-400">No concept groups yet.</p>
          <button
            type="button"
            onClick={addGroup}
            className="mt-2 text-xs font-semibold text-[#00a86b] hover:text-[#1b4332] cursor-pointer"
          >
            + Add your first concept group
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {groups.map((group, gi) => {
            const isOpen = openGroups.has(gi);
            const filledTopics = (group.topics || []).filter((t) => String(t).trim());
            const topicFields = group.topics?.length > 0 ? group.topics : [''];

            return (
              <div
                key={gi}
                className={`overflow-hidden rounded-lg border bg-white shadow-[0_1px_2px_rgb(15_23_42/0.04)] transition duration-200 ${
                  isOpen ? 'border-[#00a86b]/25 lg:col-span-2' : 'border-slate-100 hover:border-slate-200'
                }`}
              >
                <div className="flex w-full items-start gap-2 px-3 py-3 sm:px-4">
                  <button
                    type="button"
                    onClick={() => toggleGroup(gi)}
                    className="flex min-w-0 flex-1 items-start gap-3 text-left transition hover:opacity-90"
                    aria-expanded={isOpen}
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[#00a86b]/15 bg-[#f1f8f4] font-mono text-[10px] font-bold text-[#00a86b]">
                      {String(gi + 1).padStart(2, '0')}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13px] font-bold leading-snug text-slate-800 sm:text-sm">
                        {group.title?.trim() || 'Untitled group'}
                      </span>
                      {!isOpen && (
                        <span className="mt-1 block text-[11px] font-medium text-slate-400">
                          {filledTopics.length} sub-topic{filledTopics.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </span>
                    <ChevronDown
                      className={`mt-0.5 h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-[#00a86b]' : ''
                      }`}
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeGroup(gi)}
                    className="mt-0.5 shrink-0 rounded-md p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-500 cursor-pointer"
                    title="Remove group"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {isOpen && (
                  <div className="border-t border-slate-100 bg-slate-50/50 px-4 py-3">
                    <div className="mb-3">
                      <label className="admin-label !text-[10px]">Group title</label>
                      <input
                        type="text"
                        className="admin-input !text-sm mt-1"
                        placeholder="e.g. Python fundamentals for data analysis"
                        value={group.title || ''}
                        onChange={(e) => updateGroup(gi, { title: e.target.value })}
                      />
                    </div>

                    <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Sub-topics
                    </p>
                    <ul className="space-y-2">
                      {topicFields.map((topic, ti) => (
                        <li key={ti} className="flex items-start gap-2">
                          <CheckCircle2
                            className="mt-2.5 h-3.5 w-3.5 shrink-0 text-[#00a86b]"
                            strokeWidth={2.5}
                          />
                          <input
                            type="text"
                            className="admin-input !text-xs flex-1 !py-2"
                            placeholder="e.g. Variables, data types & control flow"
                            value={topic}
                            onChange={(e) => updateTopic(gi, ti, e.target.value)}
                          />
                          <button
                            type="button"
                            onClick={() => removeTopic(gi, ti)}
                            className="mt-1.5 shrink-0 rounded p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
                            title="Remove sub-topic"
                          >
                            <Trash2 size={12} />
                          </button>
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => addTopic(gi)}
                      className="mt-3 text-[11px] font-semibold text-[#00a86b] hover:text-[#1b4332] cursor-pointer"
                    >
                      + Add sub-topic
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
