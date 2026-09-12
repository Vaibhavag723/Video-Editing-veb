import { useState } from 'react';
import { signUp } from '../../api';
import AuthShell from './AuthShell';
import GoogleSignIn from './GoogleSignIn';
import { ArrowRightIcon } from '../site/landing/icons.jsx';

// Create-account page — FlowStep design. Reached from the site's
// "Get Started" CTA; success hands the user object back to App via onAuthed.
export default function SignUp({ onAuthed, onSignIn, onBrowse }) {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (loading) return;
    setError(''); setLoading(true);
    try {
      onAuthed(await signUp(form));
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      onHome={onBrowse}
      actions={<button type="button" className="btn-get" onClick={onSignIn}>Sign in</button>}
    >
      <div className="auth-stack">
        <form className="auth-card" onSubmit={submit}>
          <p className="site-eyebrow">Get started free</p>
          <h2>Create your account</h2>
          <p className="auth-lead">Start your first edit in a minute — no installs, no watermark.</p>

          <label className="auth-field">Full name
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Alex Morgan" autoComplete="name" />
          </label>
          <label className="auth-field">Email address
            <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="alex@example.com" autoComplete="email" />
          </label>
          <label className="auth-field">Password
            <span className="auth-pass">
              <input required type={showPassword ? 'text' : 'password'} minLength="8" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="At least 8 characters, with a letter and a number" autoComplete="new-password" />
              <button type="button" className="auth-eye" onClick={() => setShowPassword((s) => !s)} aria-label="Toggle password visibility">{showPassword ? '🙈' : '👁'}</button>
            </span>
          </label>

          {error && <p className="form-error">{error}</p>}

          <button className="auth-submit" disabled={loading}>
            {loading ? <span className="auth-spinner" /> : <>Create account <ArrowRightIcon /></>}
          </button>

          <div className="auth-or"><span>or continue with</span></div>
          <GoogleSignIn onAuthed={onAuthed} />

          <p className="auth-foot">
            Already have an account?
            <button type="button" onClick={onSignIn}>Sign in</button>
          </p>
          <small className="auth-terms">By continuing, you agree to our Terms and Privacy Policy.</small>
        </form>
        {onBrowse && <button type="button" className="auth-browse" onClick={onBrowse}>← Browse the website</button>}
      </div>
    </AuthShell>
  );
}