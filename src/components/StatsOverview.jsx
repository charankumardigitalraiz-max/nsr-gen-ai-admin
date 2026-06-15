const ICON_BG = {
  emerald: 'bg-emerald-50 text-emerald-600',
  teal: 'bg-teal-50 text-teal-600',
  forest: 'bg-[#1b4332]/10 text-[#1b4332]',
  mint: 'bg-[#52b788]/15 text-[#2d6a4f]',
};

export default function StatsOverview({ stats = [] }) {
  if (!stats.length) return null;

  const cols =
    stats.length === 1
      ? 'grid-cols-1 sm:max-w-xs'
      : stats.length === 2
        ? 'grid-cols-1 sm:grid-cols-2'
        : stats.length === 3
          ? 'grid-cols-1 sm:grid-cols-3'
          : 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-4';

  return (
    <div className={`grid ${cols} gap-4`}>
      {stats.map((item) => {
        const Icon = item.icon;
        const tone = item.tone || 'emerald';
        return (
          <div key={item.label} className={`admin-stat-card ${tone}`}>
            <div className={`admin-stat-icon ${ICON_BG[tone]}`}>
              <Icon size={22} />
            </div>
            <div>
              <span className="block text-2xl font-bold text-[#1b4332] leading-none tabular-nums">
                {item.value}
              </span>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-1.5 block">
                {item.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
