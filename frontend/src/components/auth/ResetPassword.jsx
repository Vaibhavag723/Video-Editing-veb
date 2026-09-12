import { useState } from 'react';
import { resetPassword } from '../../api';
import AuthShell from './AuthShell';

// "Forgot password" step 2: deep-linked from the emailed reset URL
// (/?reset=TOKEN). Shows new password + confirmation; on success hands the
// user back to the sign-in page via `onDone`.
export default function ResetPassword({ token, onDone }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (loading) return;
    if (!/^(?=.*[a-zA-Z])(?=.*[0-9]).{8,}$/.test(password)) {
      return setError('Password must be at least 8 characters and include a letter and a number.');
    }
    if (password !== confirm) return setError('Passwords do not match.');
    setError(''); setLoading(true);
    try {
      const res = await resetPassword(token, password);
      setDone(res.message);
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      onHome={onDone}
      actions={<button type="button" className="btn-get" onClick={onDone}>Back to sign in</button>}
    >
      <div className="auth-stack">
        {done ? (
          <div className="auth-card">
            <p className="site-eyebrow">All set</p>
            <h2>Password updated</h2>
            <p className="auth-lead">{done}</p>
            <button type="button" className="auth-submit" onClick={onDone}>Sign in →</button>
          </div>
        ) : (
          <form className="auth-card" onSubmit={submit}>
            <p className="site-eyebrow">Reset password</p>
            <h2>Choose a new password</h2>
            <p className="auth-lead">Thanks for verifying your identity. Pick a strong password you haven&apos;t used before.</p>
            <label className="auth-field">New password
              <span className="auth-pass">
                <input required minLength="8" type={show ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters, with a letter and a number" autoComplete="new-password" autoFocus />
                <button type="button" className="auth-eye" onClick={() => setShow((s) => !s)} aria-label="Toggle password visibility">{show ? '🙈' : '👁'}</button>
              </span>
            </label>
            <label className="auth-field">Confirm new password
              <span className="auth-pass">
                <input required minLength="8" type={show ? 'text' : 'password'} value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repeat your new password" autoComplete="new-password" />
                <button type="button" className="auth-eye" onClick={() => setShow((s) => !s)} aria-label="Toggle password visibility">{show ? '🙈' : '👁'}</button>
              </span>
            </label>
            {error && <p className="form-error">{error}</p>}
            <button className="auth-submit" disabled={loading}>
              {loading ? <span className="auth-spinner" /> : 'Update password →'}
            </button>
          </form>
        )}
      </div>
    </AuthShell>
  );
}