import { useState } from 'react';
import { Lock, User, Loader2, Shield } from 'lucide-react';
import { setToken } from '../lib/api';
import { login } from '../services/api';
import NavLogo from '../components/NavLogo';

export default function Login({ onLogin, showToast }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await login({ username, password });
      setToken(data.token);
      localStorage.setItem('nsr_admin_authenticated', 'true');
      showToast(`Welcome back, ${data.user?.username || 'admin'}!`);
      onLogin();
    } catch (error) {
      showToast(error.message || 'Unable to connect to backend server', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-shell">
      <div className="login-brand-panel">
        <div className="relative z-10 flex items-center gap-3">
          <NavLogo className="h-12 w-12" id="login-brand" />
          <div>
            <p className="text-white font-extrabold text-lg tracking-tight">NSR Admin</p>
            <p className="text-white/50 text-sm">GenAI ProSkills Academy</p>
          </div>
        </div>

        <div className="relative z-10 space-y-4 max-w-sm">
          <h1 className="text-3xl font-extrabold text-white leading-tight tracking-tight">
            Manage your academy content in one place
          </h1>
          <p className="text-white/55 text-sm leading-relaxed">
            Courses, placements, hiring partners, and testimonials — all synced to your website through MongoDB.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-2 text-white/35 text-xs">
          <Shield size={14} />
          <span>Secured with JWT authentication</span>
        </div>
      </div>

      <div className="login-form-panel">
        <div className="login-card">
          <div className="flex flex-col items-center text-center gap-2 mb-8">
            <NavLogo className="h-14 w-14 md:hidden" id="login-mobile" />
            <h2 className="text-xl font-bold text-[#1b4332] tracking-tight mt-2">Sign in</h2>
            <p className="text-sm text-slate-500">Enter your admin credentials to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="admin-label">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  className="admin-input !pl-10"
                  placeholder="admin"
                  required
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="admin-label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="password"
                  className="admin-input !pl-10"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="admin-btn-primary w-full justify-center !py-3 mt-1">
              {loading ? <Loader2 size={18} className="animate-spin" /> : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-[11px] text-slate-400 mt-6">
            NSR API · MongoDB backend
          </p>
        </div>
      </div>
    </div>
  );
}
