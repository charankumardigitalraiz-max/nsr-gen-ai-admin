import { useEffect, useRef, useState } from 'react';
import { ChevronDown, LogOut } from 'lucide-react';
import { fetchProfile } from '../services/api';

function getInitial(username) {
  return username?.charAt(0)?.toUpperCase() || 'A';
}

export default function AdminProfileMenu({ onLogout }) {
  const [profile, setProfile] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    fetchProfile()
      .then((data) => setProfile(data?.user ?? data))
      .catch(() => setProfile({ username: 'Admin' }));
  }, []);

  useEffect(() => {
    if (!menuOpen) return undefined;

    const onClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [menuOpen]);

  const username = profile?.username || 'Admin';

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        className="admin-profile-trigger"
        onClick={() => setMenuOpen((open) => !open)}
        aria-expanded={menuOpen}
        aria-haspopup="menu"
        aria-label="Open profile menu"
      >
        <span className="admin-profile-avatar">{getInitial(username)}</span>
        <span className="hidden sm:block text-sm font-semibold text-[#1b4332] max-w-[7.5rem] truncate">
          {username}
        </span>
        <ChevronDown
          size={14}
          className={`text-slate-400 transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {menuOpen && (
        <div className="admin-profile-menu" role="menu">
          <div className="admin-profile-menu-header">
            <span className="admin-profile-avatar admin-profile-avatar-lg">
              {getInitial(username)}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold text-[#1b4332] truncate m-0">{username}</p>
              <p className="text-xs text-slate-500 mt-0.5 m-0">Administrator</p>
            </div>
          </div>

          <div className="admin-profile-menu-divider" />

          <button
            type="button"
            role="menuitem"
            className="admin-profile-menu-item admin-profile-menu-item-danger"
            onClick={() => {
              setMenuOpen(false);
              onLogout();
            }}
          >
            <LogOut size={15} />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
