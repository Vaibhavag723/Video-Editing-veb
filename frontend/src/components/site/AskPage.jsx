import { useState } from 'react';
import { askQuestion } from '../../api';

// “Ask a question” page — the public contact form. Submissions are stored in
// contact_messages and shown in the admin panel's Questions tab.
export default function AskPage({ user }) {
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    subject: '',
    message: '',
  });
  const [error, setError] = useState('');
  const [done, setDone] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await askQuestion(form);
      setDone(res.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="site-page ask-page">
      <div className="site-hero">
        <p className="site-eyebrow">CONTACT</p>
        <h1>Ask a question</h1>
        <p className="site-sub">Questions, feedback or feature ideas — send them straight to the team. We usually reply within 1–2 days.</p>
      </div>

      {done ? (
        <div className="ask-done">
          <p className="ask-done-icon">✓</p>
          <h2>Question sent</h2>
          <p>{done}</p>
          <button type="button" className="site-btn ghost" onClick={() => { setDone(''); setForm({ ...form, subject: '', message: '' }); }}>Ask another question</button>
        </div>
      ) : (
        <form className="ask-form" onSubmit={submit}>
          <div className="ask-grid">
            <label>Your name
              <input required value={form.name} onChange={set('name')} placeholder="Alex Morgan" autoComplete="name" />
            </label>
            <label>Your email
              <input required type="email" value={form.email} onChange={set('email')} placeholder="alex@example.com" autoComplete="email" />
            </label>
          </div>
          <label>Subject
            <input required maxLength="160" value={form.subject} onChange={set('subject')} placeholder="What is this about? e.g. Export formats" />
          </label>
          <label>Your question
            <textarea required maxLength="2000" rows={6} value={form.message} onChange={set('message')} placeholder="Tell us what you need help with…" />
          </label>
          {error && <p className="form-error">{error}</p>}
          <div className="ask-actions">
            <button className="site-btn solid" disabled={loading}>{loading ? 'Sending…' : 'Send question →'}</button>
            <span className="site-muted">We'll reply to your email.</span>
          </div>
        </form>
      )}
    </section>
  );
}