import { useEffect, useRef, useState } from 'react';
import { googleLogin, googleDevLogin } from '../../api';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

// “Sign in with Google” — uses the account already logged into the browser.
// Real mode: loads Google Identity Services and shows the official button when
// VITE_GOOGLE_CLIENT_ID is configured. Demo mode: otherwise shows a simplified
// panel that calls the backend's /auth/google/dev route so the flow still works
// without creating a Google Cloud OAuth client. Styled for the FlowStep auth
// pages (see the .auth-google-* rules in styles/landing.css).
export default function GoogleSignIn({ onAuthed }) {
  const containerRef = useRef(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [devOpen, setDevOpen] = useState(false);
  const [dev, setDev] = useState({ name: '', email: '' });

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !containerRef.current) return;
    let cancelled = false;

    function attach() {
      if (cancelled || !window.google?.accounts?.id) return;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        auto_select: false,
        cancel_on_tap_outside: true,
        callback: (response) => {
          setBusy(true); setError('');
          googleLogin(response.credential)
            .then(onAuthed)
            .catch((err) => setError(err.message))
            .finally(() => setBusy(false));
        },
      });
      try {
        window.google.accounts.id.renderButton(containerRef.current, {
          theme: 'outline', size: 'large', type: 'standard', shape: 'pill',
          text: 'continue_with', width: 320, logo_alignment: 'left',
        });
      } catch { /* container may not be mounted yet */ }
    }

    if (window.google?.accounts?.id) attach();
    else {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.onload = attach;
      document.head.appendChild(script);
    }
    return () => { cancelled = true; };
  }, [onAuthed]);

  async function devSignIn(e) {
    e.preventDefault();
    setBusy(true); setError('');
    try { onAuthed(await googleDevLogin(dev)); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  if (GOOGLE_CLIENT_ID) {
    return (
      <div className="auth-google">
        <div ref={containerRef} className="auth-google-btn" />
        {busy && <p className="auth-google-note">Checking your Google account…</p>}
        {error && <p className="form-error">{error}</p>}
      </div>
    );
  }

  return (
    <div className="auth-google">
      {!devOpen ? (
        <button type="button" className="auth-google-demo" onClick={() => setDevOpen(true)}>
          <GoogleG /> Continue with Google <span className="auth-google-tag">demo</span>
        </button>
      ) : (
        <form className="auth-google-dev" onSubmit={devSignIn}>
          <label>Account name<input required value={dev.name} onChange={(e) => setDev({ ...dev, name: e.target.value })} placeholder="Alex Morgan" autoComplete="name" /></label>
          <label>Account email<input required type="email" value={dev.email} onChange={(e) => setDev({ ...dev, email: e.target.value })} placeholder="alex@example.com" autoComplete="email" /></label>
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="auth-submit" disabled={busy}>
            {busy ? <span className="auth-spinner" /> : 'Continue with Google →'}
          </button>
          <button type="button" className="auth-google-cancel" onClick={() => setDevOpen(false)}>Cancel</button>
        </form>
      )}
    </div>
  );
}

function GoogleG() {
  return (
    <svg className="auth-google-g" viewBox="0 0 48 48" width="18" height="18" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}