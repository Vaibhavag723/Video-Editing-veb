import { useEffect, useState } from 'react';
import { getAdminPosts, createAdminPost, updateAdminPost, deleteAdminPost } from '../../api';

// Blog tab: list posts, create new ones and edit / delete existing ones.
export default function PostsTab({ user }) {
  const [posts, setPosts] = useState([]);
  const [selected, setSelected] = useState(null); // null = list, {} = new, else an existing post
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true); setMsg('');
      try {
        const list = await getAdminPosts();
        if (alive) setPosts(list);
      } catch (err) { if (alive) setMsg(err.message); }
      finally { if (alive) setLoading(false); }
    }
    load();
    return () => { alive = false; };
  }, [user]);

  async function removePost(p) {
    if (!confirm('Delete post "' + (p.title || p.slug) + '"?')) return;
    try {
      await deleteAdminPost(p.id);
      setPosts(posts.filter((x) => x.id !== p.id));
      setMsg('Post deleted.');
    } catch (err) { setMsg(err.message); }
  }

  return (
    <section className="admin-section">
      <h2>Blog posts</h2>
      {msg && <p className="form-error">{msg}</p>}

      {selected === null ? (
        loading ? (
          <p className="site-muted">Loading posts…</p>
        ) : (
          <>
            <button className="admin-btn solid" onClick={() => setSelected({})}>＋ New post</button>
            <div className="post-list">
              {posts.length === 0 && <p className="site-muted">No posts yet.</p>}
              {posts.map((p) => (
                <div key={p.id} className="post-row">
                  <span className={p.published ? '' : 'off'}>{p.title}</span>
                  <span className="mono">{p.updated_at ? new Date(p.updated_at).toLocaleDateString() : ''}</span>
                  <button className="admin-btn mini" onClick={() => setSelected(p)}>Edit</button>
                  <button className="admin-btn mini danger" onClick={() => removePost(p)}>✕</button>
                </div>
              ))}
            </div>
          </>
        )
      ) : (
        <PostEditor
          user={user}
          post={selected.id ? selected : null}
          onClose={() => setSelected(null)}
        />
      )}
    </section>
  );
}

function PostEditor({ user, post, onClose }) {
  const [form, setForm] = useState({
    title: post?.title || '', slug: post?.slug || '', excerpt: post?.excerpt || '',
    content: post?.content || '', image: post?.image || '', published: post ? !!post.published : true,
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function save() {
    setSaving(true); setMsg('');
    try {
      if (post) await updateAdminPost(post.id, form);
      else await createAdminPost(form);
      setMsg('Saved ✓'); setTimeout(onClose, 500);
    } catch (err) { setMsg(err.message); }
    finally { setSaving(false); }
  }

  return (
    <div className="post-editor">
      <label>Title<input value={form.title} onChange={set('title')} placeholder="Post title" /></label>
      <label>Slug<input value={form.slug} onChange={set('slug')} placeholder="my-new-post" /></label>
      <label>Excerpt<textarea value={form.excerpt} onChange={set('excerpt')} rows={2} /></label>
      <label>Content<textarea value={form.content} onChange={set('content')} rows={8} /></label>
      <label>Image URL<input value={form.image} onChange={set('image')} placeholder="https://…" /></label>
      <label className="check"><input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} /> Published</label>
      <div className="page-editor-actions">
        <button className="admin-btn solid" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save post'}</button>
        <button className="admin-btn ghost" onClick={onClose}>Cancel</button>
        <span>{msg}</span>
      </div>
    </div>
  );
}