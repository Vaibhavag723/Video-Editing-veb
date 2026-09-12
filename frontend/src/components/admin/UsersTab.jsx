import { useEffect, useState } from 'react';
import { getAdminUsers, setAdminRole, deleteAdminUser } from '../../api';
import UserEditForm from './UserEditForm';

// Users tab: table of every account. Admins are permanent (their role badge is
// static) and the Actions column offers "Edit" + delete; regular users can be
// promoted to Admin.
export default function UsersTab({ user }) {
  const [users, setUsers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true); setMsg('');
      try {
        const list = await getAdminUsers();
        if (alive) setUsers(list);
      } catch (err) { if (alive) setMsg(err.message); }
      finally { if (alive) setLoading(false); }
    }
    load();
    return () => { alive = false; };
  }, [user]);

  // Only a promotion (user -> admin) is possible — the API rejects demotions.
  async function promote(u) {
    try {
      await setAdminRole(u.id, true);
      setUsers(users.map((x) => (x.id === u.id ? { ...x, is_admin: true } : x)));
      setMsg(`${u.email} is now an Admin.`);
    } catch (err) { setMsg(err.message); }
  }

  async function removeUser(u) {
    if (!confirm('Delete account ' + u.email + '?')) return;
    try {
      await deleteAdminUser(u.id);
      setUsers(users.filter((x) => x.id !== u.id));
    } catch (err) { setMsg(err.message); }
  }

  function onEdited(updated) {
    setUsers(users.map((x) => (x.id === updated.id ? { ...x, ...updated } : x)));
    setEditingId(null);
    setMsg(`User #${updated.id} updated ✓`);
  }

  const editingTarget = editingId ? users.find((x) => x.id === editingId) : null;

  return (
    <section className="admin-section">
      <h2>Accounts · emails · unique IDs</h2>
      {msg && <p className="form-error">{msg}</p>}

      {editingTarget && (
        <UserEditForm
          admin={user}
          user={editingTarget}
          onClose={() => setEditingId(null)}
          onSaved={onEdited}
        />
      )}

      {loading ? (
        <p className="site-muted">Loading accounts…</p>
      ) : (
        <div className="users-table">
          <div className="thead">
            <span>ID</span><span>Name</span><span>Email</span>
            <span>Role</span><span>Logins</span>
            <span>Created</span><span>Actions</span>
          </div>
          {users.map((u) => (
            <div className="trow" key={u.id}>
              <span className="mono">{u.id}</span>
              <span>{u.name}</span>
              <span className="mono">{u.email}</span>
              <span>
                <span className={`badge ${u.is_admin ? 'adm locked' : ''}`} title={u.is_admin ? 'The admin role is permanent' : ''}>
                  {u.is_admin ? 'Admin 🔒' : 'User'}
                </span>
              </span>
              <span className="mono">{u.login_success}/{u.login_count}</span>
              <span className="mono">{new Date(u.created_at).toLocaleDateString()}</span>
              <span className="actions">
                <button className="admin-btn mini" onClick={() => setEditingId(u.id)}>✎ Edit</button>
                {!u.is_admin && <button className="admin-btn mini" onClick={() => promote(u)}>Make admin</button>}
                <button className="admin-btn mini danger" onClick={() => removeUser(u)} disabled={u.id === user.id} title="Delete">✕</button>
              </span>
            </div>
          ))}
          {users.length === 0 && !loading && <p className="site-muted">No accounts found.</p>}
        </div>
      )}
    </section>
  );
}