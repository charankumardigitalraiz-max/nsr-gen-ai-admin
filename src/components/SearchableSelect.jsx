import { useEffect, useId, useRef, useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';

/**
 * @param {Object} props
 * @param {string} props.label
 * @param {string} props.placeholder
 * @param {Array<{ value: string, label: string, sublabel?: string }>} props.options
 * @param {string} props.value
 * @param {(value: string, option: object) => void} props.onChange
 * @param {boolean} [props.required]
 * @param {string} [props.emptyMessage]
 */
export default function SearchableSelect({
  label,
  placeholder = 'Search and select...',
  options = [],
  value,
  onChange,
  required = false,
  emptyMessage = 'No matches found.',
}) {
  const listId = useId();
  const rootRef = useRef(null);
  const inputRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const selected = options.find((opt) => opt.value === value);

  useEffect(() => {
    if (value && selected) setQuery(selected.label);
    else if (!value) setQuery('');
  }, [value, selected?.label]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
        if (value && selected) setQuery(selected.label);
        else if (!value) setQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selected, value]);

  const normalizedQuery = query.trim().toLowerCase();
  const filtered = options.filter((opt) => {
    if (!normalizedQuery) return true;
    const haystack = `${opt.label} ${opt.sublabel || ''}`.toLowerCase();
    return haystack.includes(normalizedQuery);
  });

  const pick = (opt) => {
    onChange(opt.value, opt);
    setQuery(opt.label);
    setOpen(false);
  };

  return (
    <div className="flex flex-col gap-1.5" ref={rootRef}>
      {label && <label className="admin-label">{label}</label>}
      <div className="relative">
        <Search
          size={15}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          ref={inputRef}
          type="text"
          className="admin-input !pl-9 !pr-9"
          placeholder={options.length ? placeholder : 'No options available'}
          value={query}
          required={required && !value}
          onChange={(e) => {
            const next = e.target.value;
            setQuery(next);
            setOpen(true);
            if (value && selected && next !== selected.label) {
              onChange('', null);
            } else if (!next.trim()) {
              onChange('', null);
            }
          }}
          onFocus={() => setOpen(true)}
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
        />
        <ChevronDown
          size={16}
          className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
        {open && (
          <ul
            id={listId}
            role="listbox"
            className="absolute z-50 mt-1 max-h-52 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
          >
            {filtered.length === 0 ? (
              <li className="px-3 py-2.5 text-xs text-slate-400">{emptyMessage}</li>
            ) : (
              filtered.map((opt) => (
                <li key={opt.value}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={value === opt.value}
                    className={`flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left text-sm transition hover:bg-[#f1f8f4] ${
                      value === opt.value ? 'bg-[#f1f8f4] text-[#1b4332]' : 'text-slate-700'
                    }`}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => pick(opt)}
                  >
                    <span className="font-semibold">{opt.label}</span>
                    {opt.sublabel && (
                      <span className="text-[11px] text-slate-400">{opt.sublabel}</span>
                    )}
                  </button>
                </li>
              ))
            )}
          </ul>
        )}
      </div>
      {options.length === 0 && (
        <p className="text-[11px] text-slate-400">{emptyMessage}</p>
      )}
    </div>
  );
}
