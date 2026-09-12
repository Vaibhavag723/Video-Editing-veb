import { useEffect, useState } from 'react';
import { getAdminLoginEvents } from '../../api';

// Logins tab: recent sign-in attempts from the login_events audit table.
export default function LoginsTab({ user }) {
  const [logins, setLogins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true); setMsg('');
      try {
        const list = await getAdminLoginEvents();
        if (alive) setLogins(list);
      } catch (err) { if (alive) setMsg(err.message); }
      finally { if (alive) setLoading(false); }
    }
    load();
    return () => { alive = false; };
  }, [user]);

  return (
    <section className="admin-section">
      <h2>Login activity</h2>
      {msg && <p className="form-error">{msg}</p>}
      {loading ? (
        <p className="site-muted">Loading logins…</p>
      ) : (
        <div className="login-list">
          {logins.length === 0 && <p className="site-muted">No sign-in events yet.</p>}
          {logins.map((l) => (
            <div key={l.id} className="login-row">
              <span className={l.success ? 'ok' : 'bad'}>{l.success ? 'OK' : 'FAIL'}</span>
              <span className="mono">{l.email}</span>
              <span className="mono">{l.user_id ? `uid ${l.user_id}` : '—'}</span>
              <span className="mono">{new Date(l.created_at).toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}