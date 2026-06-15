export default function PageHeader({ title, subtitle, action }) {
  return (
    <div className="admin-page-header">
      <div>
        <h2 className="admin-page-title">{title}</h2>
        {subtitle && <p className="admin-page-subtitle">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
