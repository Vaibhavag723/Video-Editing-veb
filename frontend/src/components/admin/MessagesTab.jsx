import { useEffect, useState } from 'react';
import { getAdminMessages } from '../../api';

// Questions tab: questions submitted through the public "Ask a question" form.
export default function MessagesTab({ user }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true); setMsg('');
      try {
        const list = await getAdminMessages();
        if (alive) setMessages(list);
      } catch (err) { if (alive) setMsg(err.message); }
      finally { if (alive) setLoading(false); }
    }
    load();
    return () => { alive = false; };
  }, [user]);

  return (
    <section className="admin-section">
      <h2>Questions from the “Ask a question” form</h2>
      {msg && <p className="form-error">{msg}</p>}
      {loading ? (
        <p className="site-muted">Loading questions…</p>
      ) : (
        <div className="post-list">
          {messages.length === 0 && <p className="site-muted">No questions submitted yet.</p>}
          {messages.map((m) => (
            <div key={m.id} className="question-row">
              <div className="question-head">
                <b>{m.subject}</b>
                <span className="mono">{m.name} · {m.email} · {new Date(m.created_at).toLocaleString()}</span>
              </div>
              <p className="question-body">{m.message}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}