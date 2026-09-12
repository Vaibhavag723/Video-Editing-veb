import { useState } from 'react';
import { updateAdminUser, setAdminRole } from '../../api';

// Admin form for editing a user account (opened from the Actions column in the
// Users tab). Edits name / email and optionally sets a new password. The admin
// role is permanent: for existing admins the role selector is locked, and for
// regular users only promotion (user -> admin) is offered.
export default function UserEditForm({ admin, user, onClose, onSaved }) {
  const isAdmin = user.is_admin;
  const [form, setForm] = useState({
    name: user.name || '',
    email: user.email || '',
    password: '',
    role: isAdmin ? 'admin' : 'user',
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function save() {
    setSaving(true); setMsg('');
    try {
      // Promote first when the role changed (user -> admin only).
      if (form.role === 'admin' && !isAdmin) {
        await setAdminRole(user.id, true);
      }
      await updateAdminUser(user.id, {
        name: form.name,
        email: form.email,
        password: form.password,
      });
      onSaved({
        id: user.id,
        name: form.name,
        email: form.email,
        is_admin: isAdmin || form.role === 'admin',
      });
      setMsg('Saved ✓');
      setTimeout(onClose, 600);
    } catch (err) { setMsg(err.message); }
    finally { setSaving(false); }
  }

  return (
    <div className="page-editor user-editor">
      <h3 className="user-editor-title">Edit user #{user.id}<span className="mono"> — {user.email}</span></h3>
      <label>Name<input value={form.name} onChange={set('name')} placeholder="Full name" /></label>
      <label>Email<input type="email" value={form.email} onChange={set('email')} placeholder="name@example.com" /></label>
      <label>New password<input type="password" value={form.password} onChange={set('password')} placeholder="Leave blank to keep the current password" autoComplete="new-password" /></label>
      <label>Role
        {isAdmin ? (
          <input disabled readOnly value="Admin (permanent)" title="The admin role cannot be changed" />
        ) : (
          <select value={form.role} onChange={set('role')}>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        )}
      </label>
      {isAdmin && <p className="site-muted">🔒 The admin role is permanent and cannot be changed.</p>}
      <div className="page-editor-actions">
        <button className="admin-btn solid" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
        <button className="admin-btn ghost" onClick={onClose}>Cancel</button>
        <span>{msg}</span>
      </div>
    </div>
  );
}