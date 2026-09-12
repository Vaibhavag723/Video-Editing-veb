import { useEffect, useState } from 'react';
import { getAdminStats } from '../../api';

const STAT_LABELS = ['Users', 'Admins', 'Posts', 'Pages', 'Logins'];
const STAT_KEYS = ['users', 'admins', 'posts', 'pages', 'logins'];

// Dashboard tab: summary counts listed at the top of the admin panel.
export default function DashboardTab({ user }) {
  const [stats, setStats] = useState({ users: 0, admins: 0, posts: 0, pages: 0, logins: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true); setError('');
      try {
        const s = await getAdminStats();
        if (alive) setStats(s);
      } catch (err) { if (alive) setError(err.message); }
      finally { if (alive) setLoading(false); }
    }
    load();
    return () => { alive = false; };
  }, [user]);

  return (
    <section className="admin-section">
      <h2>Dashboard</h2>
      <div className="stats">
        {STAT_LABELS.map((label, i) => (
          <div key={label} className="stat">
            <b>{stats[STAT_KEYS[i]] ?? 0}</b>
            <span>{label}</span>
          </div>
        ))}
      </div>
      {loading && <p className="site-muted">Loading…</p>}
      {error && <p className="form-error">{error}</p>}
    </section>
  );
}