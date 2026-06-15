import { Globe, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import AdminTableScroll from '../components/AdminTableScroll';

const WEBSITE_SECTIONS = [
  {
    group: 'Tier 1 — Backend + Admin ready (website not wired yet)',
    items: [
      {
        website: 'Courses listing & detail pages',
        websiteFile: 'courseDetails.js',
        api: 'GET /api/courses',
        adminTab: 'Courses',
        status: 'admin-ready',
        fields: 'title, slug, tagline, shortDesc, duration, level, mode, description, modules, skills, tools, outcomes, image, logo, icon, color, accent, concepts, whoFor',
        adminGap: 'All detail-page fields now in admin form',
      },
      {
        website: 'Placed students / success stories',
        websiteFile: 'content.js → SUCCESSFUL_STUDENTS',
        api: 'GET /api/placements',
        adminTab: 'Placed Students',
        status: 'admin-ready',
        fields: 'name, role, courseSlug, company, package, initial, image, imageAlt, tags, quote',
        adminGap: 'imageAlt not in form (optional)',
      },
      {
        website: 'Hiring partners grid',
        websiteFile: 'content.js → HIRING_PARTNER_BRANDS',
        api: 'GET /api/partners',
        adminTab: 'Hiring Partners',
        status: 'admin-ready',
        fields: 'name, logo, color',
        adminGap: 'Fully covered',
      },
      {
        website: 'Recruiter / industry testimonials',
        websiteFile: 'content.js → RECRUITER_TESTIMONIALS',
        api: 'GET /api/testimonials_recruiter',
        adminTab: 'Recruiter Quotes',
        status: 'admin-ready',
        fields: 'name, role, company, quote, avatar',
        adminGap: 'Fully covered',
      },
      {
        website: 'Video testimonials',
        websiteFile: 'content.js → VIDEO_TESTIMONIALS',
        api: 'GET /api/testimonials_video',
        adminTab: 'Video Reviews',
        status: 'admin-ready',
        fields: 'studentName, role, company, quote, videoUrl, avatar',
        adminGap: 'Fully covered',
      },
    ],
  },
  {
    group: 'Tier 2 — Website only (needs new backend + admin screen)',
    items: [
      { website: 'Homepage hero banners', websiteFile: 'Hero.jsx', api: '—', adminTab: '—', status: 'missing', fields: 'src, alt (carousel slides)' },
      { website: 'Home section CTAs', websiteFile: 'content.js → HOME_SECTION_BANNERS', api: '—', adminTab: '—', status: 'missing', fields: 'src, alt, eyebrow, title, description, ctaLabel, ctaHref' },
      { website: 'About / Contact / Offline hero images', websiteFile: 'AboutPage, ContactPage, OfflineCenterPage', api: '—', adminTab: '—', status: 'missing', fields: 'banner images per page' },
      { website: 'Contact & academy info', websiteFile: 'contact.js', api: '—', adminTab: '—', status: 'missing', fields: 'phone, email, address, hours, social links, WhatsApp' },
      { website: 'Training services', websiteFile: 'content.js → TRAINING_SERVICES', api: '—', adminTab: '—', status: 'missing', fields: 'icon, title, desc, tag, accent, image' },
      { website: 'Blogs', websiteFile: 'content.js + blogDetails.js', api: '—', adminTab: '—', status: 'missing', fields: 'slug, title, excerpt, sections[], author, tags' },
      { website: 'FAQs', websiteFile: 'HomeFaqSection.jsx', api: '—', adminTab: '—', status: 'missing', fields: 'question, answer pairs' },
      { website: 'Site stats & batch dates', websiteFile: 'HERO_STATS, Footer, Navbar', api: '—', adminTab: '—', status: 'missing', fields: '500+ students, LPA range, batch date text' },
    ],
  },
  {
    group: 'Tier 3 — Lower priority / mostly static',
    items: [
      { website: 'Roadmap milestones', websiteFile: 'content.js → ROADMAP', api: '—', adminTab: '—', status: 'missing', fields: 'step, title, desc, icon' },
      { website: 'Placement process steps', websiteFile: 'PLACEMENT_PROCESS_STEPS', api: '—', adminTab: '—', status: 'missing', fields: 'step, title, desc, image' },
      { website: 'About page pillars & mission', websiteFile: 'AboutContent.jsx + AI_PILLARS', api: '—', adminTab: '—', status: 'missing', fields: 'pillars, values, journey steps' },
      { website: 'Founders section', websiteFile: 'FOUNDERS_INFO', api: '—', adminTab: '—', status: 'missing', fields: 'name, role, credentials, avatar' },
      { website: 'Floating promo videos', websiteFile: 'FLOATING_PROMO_VIDEOS', api: '—', adminTab: '—', status: 'missing', fields: 'src, title, label' },
      { website: 'Navigation & footer links', websiteFile: 'routes.js', api: '—', adminTab: '—', status: 'static', fields: 'Usually code-managed' },
    ],
  },
];

const STATUS_META = {
  'admin-ready': {
    label: 'Admin + API ready',
    sublabel: 'Website still uses hardcoded files',
    icon: AlertTriangle,
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  missing: {
    label: 'Not in backend',
    sublabel: 'Needs new API resource + admin screen',
    icon: XCircle,
    className: 'bg-red-50 text-red-700 border-red-200',
  },
  static: {
    label: 'Static / code',
    sublabel: 'Low priority for CMS',
    icon: CheckCircle2,
    className: 'bg-slate-50 text-slate-600 border-slate-200',
  },
};

export default function WebsiteContent() {
  return (
    <div className="flex flex-col gap-5">
      <div className="admin-page-header">
        <div>
          <h2 className="admin-page-title">Website ↔ Backend Map</h2>
          <p className="admin-page-subtitle">
            What the public website shows vs what you can edit in admin today.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
          <Globe size={14} />
          Website not API-connected yet
        </div>
      </div>

      <div className="admin-card p-5 flex flex-col gap-3">
        <h3 className="text-sm font-bold text-[#1b4332] m-0">Current situation</h3>
        <ul className="text-sm text-slate-600 m-0 pl-4 space-y-1.5">
          <li><strong>Admin + MongoDB</strong> — 5 content types saved via API</li>
          <li><strong>Website</strong> — still reads <code className="text-xs bg-slate-100 px-1 rounded">website/src/constants/*.js</code> (no fetch calls)</li>
          <li><strong>Next step</strong> — wire website to <code className="text-xs bg-slate-100 px-1 rounded">GET /api/courses</code>, placements, partners, testimonials</li>
        </ul>
      </div>

      {WEBSITE_SECTIONS.map((section) => (
        <div key={section.group} className="flex flex-col gap-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 m-0 px-1">
            {section.group}
          </h3>
          <AdminTableScroll>
              <table className="admin-table min-w-[720px]">
                <thead>
                  <tr className="bg-[#f1f8f4]/60 border-b border-[#1b4332]/8">
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#1b4332]/60">Website section</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#1b4332]/60">Source file</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#1b4332]/60">Backend API</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#1b4332]/60">Admin tab</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#1b4332]/60">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {section.items.map((row) => {
                    const meta = STATUS_META[row.status];
                    const Icon = meta.icon;
                    return (
                      <tr key={row.website} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                        <td className="px-4 py-3">
                          <div className="text-sm font-semibold text-[#1b4332]">{row.website}</div>
                          {row.adminGap && (
                            <div className="text-[11px] text-slate-400 mt-0.5">{row.adminGap}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500 font-mono">{row.websiteFile}</td>
                        <td className="px-4 py-3 text-xs text-slate-600 font-mono">{row.api}</td>
                        <td className="px-4 py-3 text-sm text-slate-700">{row.adminTab}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold border ${meta.className}`}>
                            <Icon size={12} />
                            {meta.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
          </AdminTableScroll>
        </div>
      ))}

      <div className="admin-card p-5">
        <h3 className="text-sm font-bold text-[#1b4332] m-0 mb-3">Backend resources today</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs font-mono text-slate-600">
          {['courses', 'placements', 'partners', 'testimonials_recruiter', 'testimonials_video'].map((key) => (
            <div key={key} className="px-3 py-2 bg-[#f1f8f4] rounded-lg border border-[#1b4332]/8">
              GET /api/{key}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
