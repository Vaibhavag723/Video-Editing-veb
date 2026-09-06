import { useEffect, useState } from 'react';
import { getTextTemplates, getStickers, getMusicList } from '../api';

/**
 * Dynamic "Creative Library" — all content (text templates, stickers,
 * background music) is loaded live from the PostgreSQL backend, and the
 * Cloud tab lists unfinished projects saved by the user.
 */
export default function Library({
  enabled, onAddTemplate, onAddSticker, onPickMusic, onToggleMusic,
  musicOn, music, projects, onSaveProject, onOpenProject, onRemoveProject, cloudSaving,
}) {
  const [tab, setTab] = useState('templates');
  const [templates, setTemplates] = useState([]);
  const [stickers, setStickers] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    Promise.all([getTextTemplates(), getStickers(), getMusicList()])
      .then(([t, s, m]) => {
        if (!alive) return;
        setTemplates(t); setStickers(s); setTracks(m); setError('');
      })
      .catch((err) => alive && setError(err.message || 'Libraries unavailable'))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, []);

  const disabledHint = !enabled ? ' (import a video first)' : '';

  return (
    <section className="library">
      <h2>Creative library</h2>
      <div className="lib-tabs" role="tablist">
        {[['templates', 'Text'], ['stickers', 'Stickers'], ['music', 'Music'], ['cloud', 'Cloud']].map(([key, label]) => (
          <button key={key} type="button" className={tab === key ? 'active' : ''} onClick={() => setTab(key)}>{label}</button>
        ))}
      </div>

      {loading && <p className="hint">Loading from PostgreSQL…</p>}
      {!loading && error && <p className="lib-error">{error}</p>}

      {!loading && !error && tab === 'templates' && (
        <div className="lib-grid templates">
          {templates.length === 0 && <p className="hint">No templates yet.</p>}
          {templates.map((t) => (
            <button key={t.id} type="button" className="tpl-card" disabled={!enabled}
              onClick={() => onAddTemplate(t)} title={`Add “${t.title}”${disabledHint}`}>
              <span style={{ fontSize: Math.min(26, t.font_size * 0.4), color: t.color, fontFamily: `'${t.font}', Inter` }}>{t.content}</span>
              <em>{t.title}</em>
            </button>
          ))}
        </div>
      )}

      {!loading && !error && tab === 'stickers' && (
        <div className="lib-grid stickers">
          {stickers.length === 0 && <p className="hint">No stickers yet.</p>}
          {stickers.map((s) => (
            <button key={s.id} type="button" className="stk" disabled={!enabled}
              onClick={() => onAddSticker(s)} title={`Add ${s.name} sticker${disabledHint}`}>
              <span style={{ fontSize: 34 }}>{s.glyph}</span>
            </button>
          ))}
        </div>
      )}

      {!loading && !error && tab === 'music' && (
        <div className="lib-list music">
          {tracks.length === 0 && <p className="hint">No tracks yet.</p>}
          {tracks.map((tr) => {
            const active = music?.id === tr.id;
            const isOn = active && musicOn;
            return (
              <div key={tr.id} className={active ? 'track active' : 'track'}>
                <button type="button" disabled={active && musicOn}
                  onClick={() => (active ? onToggleMusic() : onPickMusic(tr))}
                  title={active ? (isOn ? 'Pause music' : 'Play music') : 'Use this track'}>
                  {active && isOn ? '❚❚' : '▶'}
                </button>
                <div className="track-info">
                  <b>{tr.title}</b>
                  {tr.artist ? <span>{tr.artist}</span> : null}
                </div>
                <em>{tr.category}</em>
              </div>
            );
          })}
          {music && <button type="button" className="lib-stop" onClick={onToggleMusic}>{musicOn ? '⏸ Pause music' : '▶ Resume music'}</button>}
        </div>
      )}

      {!loading && !error && tab === 'cloud' && (
        <div className="lib-list cloud">
          <button type="button" className="cloud-save" disabled={cloudSaving} onClick={onSaveProject}>
            {cloudSaving ? 'Saving…' : '☁ Save this project'}
          </button>
          <p className="hint">Unfinished edits are saved to the cloud and resumed in any browser.</p>
          {projects.length === 0 && <p className="hint">No saved projects yet.</p>}
          {projects.map((p) => (
            <div key={p.id} className="cloud-item">
              <button type="button" className="open" onClick={() => onOpenProject(p.id)}>
                <b>{p.name}</b>
                <span>{new Date(p.updatedAt).toLocaleString()}</span>
              </button>
              <button type="button" className="del" onClick={() => onRemoveProject(p.id)} title="Delete">✕</button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}