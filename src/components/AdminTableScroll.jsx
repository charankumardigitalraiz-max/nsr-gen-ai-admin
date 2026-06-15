/**
 * Scrollable table container — vertical scroll for long lists, horizontal on narrow screens.
 * Sticky header styles live in index.css (.admin-table-wrap).
 */
export default function AdminTableScroll({ children, className = '' }) {
  return (
    <div className={`admin-card p-0 overflow-hidden ${className}`.trim()}>
      <div className="admin-table-wrap">{children}</div>
    </div>
  );
}
