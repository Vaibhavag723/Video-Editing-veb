import { useEffect, useState } from 'react';
import { getAdminPages, updateAdminPage } from '../../api';

const PAGE_KEYS = [
  ['home', 'Home'],
  ['about', 'About'],
  ['how-it-works', 'How it works'],
  ['pricing', 'Pricing'],
  ['features', 'Features'],
];

// Pages tab: pick a website page in the tab strip and edit its title / hero / body.
export default function PagesTab({ user }) {
  const [pages, setPages] = useState([]);
  const [editingKey, setEditingKey] = useState('home');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true); setMsg('');
      try {
        const list = await getAdminPages();
        if (alive) setPages(list);
      } catch (err) { if (alive) setMsg(err.message); }
      finally { if (alive) setLoading(false); }
    }
    load();
    return () => { alive = false; };
  }, [user]);

  return (
    <section className="admin-section">
      <h2>Edit website pages</h2>
      {msg && <p className="form-error">{msg}</p>}
      <div className="page-tabs">
        {PAGE_KEYS.map(([key, label]) => (
          <button key={key} className={editingKey === key ? 'active' : ''} onClick={() => setEditingKey(key)}>{label}</button>
        ))}
      </div>
      {loading ? (
        <p className="site-muted">Loading pages…</p>
      ) : (
        pages.filter((p) => p.key === editingKey).map((p) => (
          <PageEditor key={p.key} user={user} page={p} onSaved={() => setMsg('Page saved ✓')} />
        ))
      )}
    </section>
  );
}

function PageEditor({ user, page, onSaved }) {
  const [title, setTitle] = useState(page.title || '');
  const [hero, setHero] = useState(page.hero || '');
  const [body, setBody] = useState(page.body || '');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  useEffect(() => { setTitle(page.title || ''); setHero(page.hero || ''); setBody(page.body || ''); setMsg(''); }, [page]);

  async function save() {
    setSaving(true); setMsg('');
    try {
      await updateAdminPage(page.key, { title, hero, body });
      onSaved();
      setMsg('Saved ✓');
    } catch (err) { setMsg(err.message); }
    finally { setSaving(false); }
  }

  return (
    <div className="page-editor">
      <label>Title<input value={title} onChange={(e) => setTitle(e.target.value)} /></label>
      <label>Headline (hero)<textarea value={hero} onChange={(e) => setHero(e.target.value)} rows={2} /></label>
      <label>Body content<textarea value={body} onChange={(e) => setBody(e.target.value)} rows={6} /></label>
      <div className="page-editor-actions">
        <button className="admin-btn solid" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
        <span>{msg}</span>
      </div>
    </div>
  );
}