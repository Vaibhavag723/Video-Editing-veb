import { useState } from 'react';
import { forgotPassword } from '../../api';

// "Forgot password" step 1: enter the account email. The backend emails a
// one-time reset link. When no SMTP is configured (dev mode) the backend also
// returns the link so the flow can be completed without a mail server.
// Rendered inside the Sign in page's FlowStep card (see AuthShell.jsx).
export default function ForgotPassword({ onBack }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(null); // { message, devResetLink }
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (loading) return;
    setError(''); setLoading(true);
    try {
      setDone(await forgotPassword(email));
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="auth-card">
        <p className="site-eyebrow">Check your inbox</p>
        <h2>Reset link sent</h2>
        <p className="auth-lead">{done.message}</p>
        {done.devResetLink && (
          <p className="auth-dev">
            Demo mode (no SMTP configured yet) — open this link to finish:{' '}
            <a href={done.devResetLink}>{done.devResetLink}</a>
          </p>
        )}
        <button type="button" className="auth-alt" onClick={onBack}>← Back to sign in</button>
      </div>
    );
  }

  return (
    <form className="auth-card" onSubmit={submit}>
      <p className="site-eyebrow">Forgot password</p>
      <h2>Reset your password</h2>
      <p className="auth-lead">Enter the email linked to your VidioCut account and we will send you a reset link.</p>
      <label className="auth-field">Email address
        <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="alex@example.com" autoComplete="email" autoFocus />
      </label>
      {error && <p className="form-error">{error}</p>}
      <button className="auth-submit" disabled={loading}>
        {loading ? <span className="auth-spinner" /> : 'Send reset link →'}
      </button>
      <p className="auth-foot">
        <button type="button" onClick={onBack}>← Back to sign in</button>
      </p>
    </form>
  );
}