import { useState } from 'react';
import { logIn } from '../../api';
import AuthShell from './AuthShell';
import ForgotPassword from './ForgotPassword';
import GoogleSignIn from './GoogleSignIn';
import { ArrowRightIcon } from '../site/landing/icons.jsx';

// Sign in page — FlowStep design. Guests land here from the site's
// "Sign in" CTA; success hands the user object back to App via onAuthed.
export default function SignIn({ onAuthed, onSignUp, onBrowse }) {
  const [mode, setMode] = useState('signin'); // 'signin' | 'forgot'
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (loading) return;
    setError(''); setLoading(true);
    try {
      onAuthed(await logIn(form));
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      onHome={onBrowse}
      actions={<button type="button" className="btn-get" onClick={onSignUp}>Create account</button>}
    >
      <div className="auth-stack">
        {mode === 'forgot' ? (
          <ForgotPassword onBack={() => setMode('signin')} />
        ) : (
          <form className="auth-card" onSubmit={submit}>
            <p className="site-eyebrow">Welcome back</p>
            <h2>Make your next cut.</h2>
            <p className="auth-lead">Enter your details to keep editing.</p>

            <label className="auth-field">Email address
              <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="alex@example.com" autoComplete="email" />
            </label>
            <label className="auth-field">Password
              <span className="auth-pass">
                <input required type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Your password" autoComplete="current-password" />
                <button type="button" className="auth-eye" onClick={() => setShowPassword((s) => !s)} aria-label="Toggle password visibility">{showPassword ? '🙈' : '👁'}</button>
              </span>
            </label>

            {error && <p className="form-error">{error}</p>}

            <p className="auth-forgot">
              <button type="button" onClick={() => setMode('forgot')}>Forgot password?</button>
            </p>

            <button className="auth-submit" disabled={loading}>
              {loading ? <span className="auth-spinner" /> : <>Sign in <ArrowRightIcon /></>}
            </button>

            <div className="auth-or"><span>or continue with</span></div>
            <GoogleSignIn onAuthed={onAuthed} />

            <p className="auth-foot">
              New to VidioCut?
              <button type="button" onClick={onSignUp}>Create an account</button>
            </p>
          </form>
        )}
        {onBrowse && <button type="button" className="auth-browse" onClick={onBrowse}>← Browse the website</button>}
      </div>
    </AuthShell>
  );
}