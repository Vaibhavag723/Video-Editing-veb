import { useEffect, useRef, useState } from 'react';
import Library from './components/Library';
import {
  getCloudProjects, saveCloudProject, getCloudProject, deleteCloudProject, getMusicList,
  setSessionToken, clearSessionToken, setOnSessionExpired,
} from './api';
import SignIn from './components/auth/SignIn';
import SignUp from './components/auth/SignUp';
import CutTools from './components/CutTools';
import ChatBot from './components/chat/ChatBot';
import Site from './components/Site';
import AdminPanel from './components/admin/Admin';
import ResetPassword from './components/auth/ResetPassword';
import Logo from './components/Logo';

const time = (value = 0) => {
  const seconds = Number.isFinite(value) ? Math.max(0, value) : 0;
  return `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`;
};

let overlayCounter = 0;
let audioCounter = 0;

/* ---------- Overlay animation presets ----------
   The presets are evaluated while the overlays are drawn onto the export
   canvas, so the same motion shows up in the preview and is recorded into the
   exported .webm (the export records that very canvas).                    */
const OVERLAY_ANIMATIONS = [
  { id: 'none', label: 'None' },
  { id: 'fade', label: 'Fade In' },
  { id: 'slide-up', label: 'Slide Up' },
  { id: 'zoom-out', label: 'Zoom Out' },
];
const ANIM_DEFAULTS = { anim: 'none', animDur: 0.6, animDelay: 0 };

const animationLabel = (id) =>
  (OVERLAY_ANIMATIONS.find((a) => a.id === id) || OVERLAY_ANIMATIONS[0]).label;
const animDuration = (o) => (Number.isFinite(o?.animDur) && o.animDur > 0 ? o.animDur : ANIM_DEFAULTS.animDur);
const animDelay = (o) => (Number.isFinite(o?.animDelay) ? o.animDelay : 0);
const isAnimated = (o) => Boolean(o?.anim) && o.anim !== 'none';

/**
 * Eased 0→1 progress of an overlay's entrance, `elapsed` seconds after the in
 * point. While paused (scrubbing / editing) the settled state is shown so the
 * layer stays visible and stays draggable.
 */
function overlayProgress(o, elapsed, live) {
  if (!isAnimated(o) || !live) return 1;
  const p = Math.min(1, Math.max(0, (elapsed - animDelay(o)) / animDuration(o)));
  return p * p * (3 - 2 * p); // smoothstep easing
}

/** Per-frame transform for one overlay: opacity + vertical offset + zoom. */
function overlayMotion(o, elapsed, live) {
  const p = overlayProgress(o, elapsed, live);
  if (o.anim === 'slide-up') return { alpha: p, dy: (1 - p) * (o.size || 48) * 0.9, scale: 1 };
  if (o.anim === 'zoom-out') return { alpha: p, dy: 0, scale: 1.6 - 0.6 * p };
  return { alpha: p, dy: 0, scale: 1 };
}

function Control({ label, value, onChange, disabled, min, max, step = 1, unit = '%' }) {
  return (
    <div className="control">
      <label>{label}<output>{value}{unit}</output></label>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} disabled={disabled} />
    </div>
  );
}

function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const filesRef = useRef(null);
  const urlRef = useRef(null);
  const draggingRef = useRef(null);
  const historyRef = useRef({ stack: [], index: -1 });
  const musicRef = useRef(null);
  const importPlanRef = useRef(null);
  const audioNodeRefs = useRef({});
  const audioUrlRef = useRef([]);
  const audioImportRef = useRef(null);

  const [url, setUrl] = useState('');
  const [name, setName] = useState('Untitled project');
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);
  const [inPoint, setInPoint] = useState(0);
  const [outPoint, setOutPoint] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [volume, setVolume] = useState(100);
  const [muted, setMuted] = useState(false);
  const [cuts, setCuts] = useState([]);
  const [overlays, setOverlays] = useState([]);
  const [selectedOverlay, setSelectedOverlay] = useState(null);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [hue, setHue] = useState(0);
  const [grayscale, setGrayscale] = useState(0);
  const [blur, setBlur] = useState(0);
  const [notice, setNotice] = useState('Import a video to begin editing.');
  const [exporting, setExporting] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [res, setRes] = useState({ w: 1280, h: 720 });
  const RESOLUTIONS = [
    { label: '360p', w: 640, h: 360 },
    { label: '720p', w: 1280, h: 720 },
    { label: '1080p', w: 1920, h: 1080 },
  ];
  const [music, setMusic] = useState(null); // { id, title, artist, url }
  const [musicOn, setMusicOn] = useState(false);
  const [cloudProjects, setCloudProjects] = useState([]);
  const [cloudSaving, setCloudSaving] = useState(false);
  const [audioClips, setAudioClips] = useState([]);
  const [selectedAudio, setSelectedAudio] = useState(null);
  const [audioTracks, setAudioTracks] = useState([]);
  const [audioLibShown, setAudioLibShown] = useState(false);
  const [previewId, setPreviewId] = useState(null);

  const [user, setUser] = useState(null);
  const [route, setRoute] = useState('home'); // start visitors on the marketing landing (subbly-style) with Sign In / Open editor
  const [history, setHistory] = useState([]); // navigation history for the Back button
  // When the app is opened from the emailed "forgot password" link (/?reset=TOKEN)
  // the token is captured here and the reset screen is shown instead of the site.
  const [resetToken, setResetToken] = useState(() => new URLSearchParams(window.location.search).get('reset'));

  // If any request comes back 401 (expired token, deleted account, server
  // restart), drop the stale session and send the user to sign in rather than
  // leaving the UI looking logged-in while every action silently fails.
  useEffect(() => {
    setOnSessionExpired(() => {
      setUser(null);
      setHistory([]);
      setRoute('signin');
    });
    return () => setOnSessionExpired(null);
  }, []);

  // Navigate to `next`, remembering the current view so Back can return to it.
  const go = (next) => { if (next !== route) setHistory((h) => [...h, route]); setRoute(next); };
  const back = () => {
    if (!history.length) { setRoute('home'); return; }
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1)); setRoute(prev);
  };
  const canGoBack = history.length > 0;

  const adjustments = { brightness, contrast, saturation, hue, grayscale, blur };

  const snapshot = () => ({ adjustments, cuts, inPoint, outPoint, overlays });
  const commit = () => {
    const { stack, index } = historyRef.current;
    stack.length = index + 1;
    stack.push(JSON.stringify(snapshot()));
    if (stack.length > 100) stack.shift();
    historyRef.current.index = stack.length - 1;
  };
  const apply = (json) => {
    const s = JSON.parse(json);
    setBrightness(s.adjustments.brightness); setContrast(s.adjustments.contrast); setSaturation(s.adjustments.saturation);
    setHue(s.adjustments.hue); setGrayscale(s.adjustments.grayscale); setBlur(s.adjustments.blur);
    setCuts(s.cuts); setInPoint(s.inPoint); setOutPoint(s.outPoint); setOverlays(s.overlays);
    setSelectedOverlay((cur) => (cur && s.overlays.some((o) => o.id === cur) ? cur : null));
  };
  const undo = () => { const { stack, index } = historyRef.current; if (index > 0) { historyRef.current.index = index - 1; apply(stack[index - 1]); } };
  const redo = () => { const { stack, index } = historyRef.current; if (index < stack.length - 1) { historyRef.current.index = index + 1; apply(stack[index + 1]); } };

  useEffect(() => () => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    audioUrlRef.current.forEach((u) => URL.revokeObjectURL(u));
  }, []);
  function importVideo(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    const nextUrl = URL.createObjectURL(file);
    urlRef.current = nextUrl;
    setUrl(nextUrl);
    setName(file.name.replace(/\.[^/.]+$/, '') || 'Untitled project');
    setDuration(0); setCurrent(0); setInPoint(0); setOutPoint(0); setCuts([]); setOverlays([]); setSelectedOverlay(null);
    setAudioClips([]); setSelectedAudio(null); setPreviewId(null); setPlaying(false);
    historyRef.current = { stack: [], index: -1 };
    setNotice('Video imported. Set in/out points, jigsaw cuts, add text and color, then export.');
    }

  function loaded() {
    const v = videoRef.current; if (!v) return;
    const length = Number.isFinite(v.duration) && v.duration > 0 ? v.duration : 0;
    setDuration(length);
    if (length) setOutPoint((o) => Math.min(o > 0 ? o : length, length));
    v.muted = muted; v.volume = volume / 100;
  }


  const filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) hue-rotate(${hue}deg) grayscale(${grayscale}%) blur(${blur}px)`;
  const enabled = Boolean(url);

  function drawFrame() {
    const canvas = canvasRef.current, video = videoRef.current;
    const ctx = canvas && canvas.getContext('2d');
    if (!ctx || !video || !video.videoWidth) return;
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    const scale = Math.max(w / video.videoWidth, h / video.videoHeight);
    const dw = video.videoWidth * scale, dh = video.videoHeight * scale;
    ctx.save();
    ctx.filter = filter;
    ctx.drawImage(video, (w - dw) / 2, (h - dh) / 2, dw, dh);
    ctx.restore();
    // Entrance animations are evaluated against the playhead (relative to the
    // in point) so the frame the editor shows is the frame the export records.
    const at = Number.isFinite(video.currentTime) ? video.currentTime : current;
    const live = playing || exporting;
    overlays.forEach((o) => {
      const { alpha, dy, scale: zoom } = overlayMotion(o, at - inPoint, live);
      if (alpha <= 0.001) return; // not on screen yet — nothing to draw
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(o.x * w, o.y * h + dy);
      ctx.scale(zoom, zoom);
      if (o.kind === 'sticker') {
        ctx.font = `${o.size}px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(o.glyph || '✨', 0, 0);
        if (o.id === selectedOverlay) {
          const m = ctx.measureText(o.glyph || '✨');
          ctx.strokeStyle = '#00f0c8'; ctx.lineWidth = 1.5;
          ctx.strokeRect(-m.width / 2 - 7, -o.size / 2 - 5, m.width + 14, o.size + 10);
        }
      } else {
        ctx.font = `${o.size}px ${o.font || 'Inter'}, Arial, sans-serif`;
        ctx.fillStyle = o.color || '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(o.text, 0, 0);
        if (o.id === selectedOverlay) {
          const m = ctx.measureText(o.text);
          ctx.strokeStyle = '#00f0c8'; ctx.lineWidth = 1.5;
          ctx.strokeRect(-m.width / 2 - 6, -o.size / 2 - 4, m.width + 12, o.size + 8);
        }
      }
      ctx.restore();
    });
  }

  useEffect(() => {
    let raf; let last = -1;
    const tick = () => {
      const video = videoRef.current;
      if (video && enabled) {
        if (video.currentTime !== last) { last = video.currentTime; setCurrent(video.currentTime); }
        if (playing && Number.isFinite(video.duration) && video.duration > 0 && outPoint > inPoint && video.currentTime >= outPoint - 0.002) { video.pause(); setPlaying(false); video.currentTime = inPoint; last = inPoint; setCurrent(inPoint); }
        drawFrame();
        if (playing && !exporting) syncAudioClips(video.currentTime);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [enabled, playing, inPoint, outPoint, adjustments, overlays, selectedOverlay, audioClips, muted, volume, exporting]);
  const seek = (value) => { const v = videoRef.current; if (v) v.currentTime = Number(value); setCurrent(Number(value)); };

  function togglePlay() {
    const video = videoRef.current; if (!video) return;
    if (video.paused) {
      if (video.currentTime < inPoint || video.currentTime >= outPoint) seek(inPoint);
      video.playbackRate = speed; video.muted = muted; video.volume = volume / 100;
      setPlaying(true);
      video.play().catch(() => setPlaying(false));
      if (musicRef.current && musicOn && music) { musicRef.current.currentTime = 0; musicRef.current.play().catch(() => {}); }
      pauseClips();
    } else {
      video.pause();
      setPlaying(false);
      pauseClips();
      if (musicRef.current) musicRef.current.pause();
    }
  }

  const stepFrame = (dir) => { if (enabled) { const v = videoRef.current; seek(v ? v.currentTime + dir / 25 : 0); } };

  function updateSpeed(v) { setSpeed(v); if (videoRef.current) videoRef.current.playbackRate = v; }
  function updateVolume(v) { setVolume(v); if (videoRef.current) videoRef.current.volume = v / 100; if (musicRef.current) musicRef.current.volume = v / 100; if (v > 0) setMuted(false); }
  function toggleMute() { const m = !muted; setMuted(m); if (videoRef.current) videoRef.current.muted = m; if (musicRef.current) musicRef.current.muted = m; }

  function addCut() {
    if (!duration || current <= 0.05 || current >= duration - 0.05 || cuts.some((c) => Math.abs(c - current) < 0.1)) return;
    commit(); const next = [...cuts, current].sort((a, b) => a - b); setCuts(next); setNotice(`Clip split at ${time(current)}.`);
  }
  function removeCut(cut) { commit(); setCuts(cuts.filter((c) => c !== cut)); }

  function addOverlay() {
    commit(); overlayCounter += 1;
    const o = { id: overlayCounter, text: 'Add text', x: 0.5, y: 0.5, size: 48, color: '#ffffff', ...ANIM_DEFAULTS };
    setOverlays([...overlays, o]); setSelectedOverlay(o.id); setNotice('Drag text on the preview to position it.');
  }
  function updateOverlay(id, patch) { setOverlays(overlays.map((o) => (o.id === id ? { ...o, ...patch } : o))); }
  function setAnimation(id, anim) {
    const current = overlays.find((o) => o.id === id);
    if (!current) return;
    commit();
    updateOverlay(id, { anim, animDur: animDuration(current), animDelay: animDelay(current) });
    setNotice(isAnimated({ anim })
      ? `Animation: ${animationLabel(anim)} — plays from the in point (${time(inPoint)}) and is baked into the export.`
      : 'Animation removed from this layer.');
  }
  function removeOverlay(id) { commit(); setOverlays(overlays.filter((o) => o.id !== id)); setSelectedOverlay((c) => (c === id ? null : c)); }

  /* ---- Creative library helpers (from PostgreSQL) ---- */
  function addTemplateText(template) {
    commit(); overlayCounter += 1;
    const o = { id: overlayCounter, kind: 'text', text: template.content, x: 0.5, y: 0.42, size: template.font_size || 48, color: template.color || '#ffffff', font: template.font || 'Inter', templateId: template.id, ...ANIM_DEFAULTS };
    setOverlays([...overlays, o]); setSelectedOverlay(o.id);
    setNotice(`Template “${template.title}” added — drag to position it.`);
  }
  function addSticker(st) {
    commit(); overlayCounter += 1;
    const o = { id: overlayCounter, kind: 'sticker', glyph: st.glyph, x: 0.5, y: 0.5, size: st.size || 64, ...ANIM_DEFAULTS };
    setOverlays([...overlays, o]); setSelectedOverlay(o.id);
    setNotice('Sticker added — drag to place it.');
  }
  function pickMusic(track) { setMusic(track); setMusicOn(true); setNotice(`Music: ${track.title} — press ▶ in the Library to pause.`); }
  function stopMusic() { setMusicOn(false); if (musicRef.current) musicRef.current.pause(); setMusic(null); setNotice('Music removed.'); }
  function toggleMusic() {
    const audio = musicRef.current;
    if (!audio || !music) return;
    if (!musicOn) { setMusicOn(true); audio.currentTime = 0; audio.play().catch(() => setNotice('Music could not load — check the track URL.')); }
    else { setMusicOn(false); audio.pause(); }
  }

  /* ---------------- Audio editing: add / trim / cut / mix clips ---------------- */
  function importAudio(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const u = URL.createObjectURL(file);
    audioUrlRef.current.push(u);
    const id = ++audioCounter;
    const clip = { id, title: file.name, url: u, start: current, trimIn: 0, trimOut: Infinity, volume: 100, muted: false };
    setAudioClips([...audioClips, clip]); setSelectedAudio(id); setPreviewId(id);
    setNotice(`Audio added: ${file.name} — use Trim In / Trim Out at the playhead, then press ▶ to hear it.`);
  }
  async function toggleAudioLibrary() {
    const show = !audioLibShown;
    setAudioLibShown(show);
    if (show && audioTracks.length === 0) {
      try { setAudioTracks(await getMusicList()); }
      catch { setNotice('Could not load the audio library — check the backend.'); }
    }
  }
  function addAudioFromTrack(track) {
    const dur = track.duration || 30;
    const id = ++audioCounter;
    const clip = { id, title: `${track.title}${track.artist ? ' — ' + track.artist : ''}`, url: track.url, start: current, trimIn: 0, trimOut: dur, volume: 80, muted: false, duration: dur };
    setAudioClips([...audioClips, clip]); setSelectedAudio(id); setPreviewId(id);
    setNotice(`Audio clip added: ${track.title} at ${time(current)} — set Trim In / Out at the playhead and set its start.`);
  }
  function updateAudio(id, patch) { setAudioClips(audioClips.map((c) => (c.id === id ? { ...c, ...patch } : c))); }
  function removeAudio(id) {
    setAudioClips(audioClips.filter((c) => c.id !== id));
    const el = audioNodeRefs.current[id];
    if (el) { el.pause(); el.removeAttribute('src'); }
    delete audioNodeRefs.current[id];
    if (selectedAudio === id) setSelectedAudio(null);
    if (previewId === id) setPreviewId(null);
    setNotice('Audio clip removed.');
  }
  function moveAudioToPlayhead(id) {
    const clip = audioClips.find((c) => c.id === id);
    if (!clip) return;
    updateAudio(id, { start: current });
    setNotice(`“${clip.title}” now starts at ${time(current)}.`);
  }
  function markAudioTrim(which) {
    if (selectedAudio == null) { setNotice('Select an audio clip to trim first.'); return; }
    const clip = audioClips.find((c) => c.id === selectedAudio);
    if (!clip) return;
    if (which === 'in') {
      const hi = Number.isFinite(clip.trimOut) ? clip.trimOut - 0.05 : 1e9;
      updateAudio(clip.id, { trimIn: Math.max(0, Math.min(current, hi)) });
      setNotice(`Trim In ${time(current)} for “${clip.title}”.`);
    } else {
      const lo = (Number.isFinite(clip.trimIn) ? clip.trimIn : 0) + 0.05;
      updateAudio(clip.id, { trimOut: Math.max(current, lo) });
      setNotice(`Trim Out ${time(current)} for “${clip.title}”.`);
    }
  }
  function previewAudio(id) {
    const clip = audioClips.find((c) => c.id === id);
    const el = audioNodeRefs.current[id];
    if (!clip || !el) return;
    if (!el.paused) { el.pause(); setPreviewId((p) => (p === id ? null : p)); return; }
    el.muted = clip.muted; el.volume = (clip.volume / 100) * (volume / 100);
    el.currentTime = Number.isFinite(clip.trimIn) ? clip.trimIn : 0;
    el.play().catch(() => {});
    setPreviewId(id);
  }
  function syncAudioClips(cur, force = false) {
    audioClips.forEach((clip) => {
      const el = audioNodeRefs.current[clip.id];
      if (!el) return;
      const s = clip.start;
      const len = Math.max(0.05, (Number.isFinite(clip.trimOut) ? clip.trimOut : 1e9) - (Number.isFinite(clip.trimIn) ? clip.trimIn : 0));
      const active = (force || playing) && cur >= s && cur < s + len;
      const vol = muted ? 0 : (volume / 100) * ((clip.muted ? 0 : 1) * (clip.volume / 100));
      if (active) {
        const t = (Number.isFinite(clip.trimIn) ? clip.trimIn : 0) + Math.min(cur - s, len - 0.02);
        el.volume = vol; el.muted = false;
        if (el.paused || Math.abs(el.currentTime - t) > 0.08) el.currentTime = t;
        if (el.paused) el.play().catch(() => {});
      } else if (!el.paused) {
        el.pause();
      }
    });
  }
  const pauseClips = () => { audioClips.forEach((c) => { const el = audioNodeRefs.current[c.id]; if (el && !el.paused) el.pause(); }); };

  useEffect(() => {
    const el = musicRef.current;
    if (!el) return;
    if (music) { el.src = music.url; el.volume = volume / 100; if (musicOn) el.play().catch(() => {}); }
    else { el.pause(); el.removeAttribute('src'); el.load(); }
  }, [music?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  function overlayPoint(e) {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: (e.clientX - rect.left) / rect.width, y: (e.clientY - rect.top) / rect.height };
  }
  function onCanvasDown(e) {
    if (!enabled) return;
    const p = overlayPoint(e); const hit = [...overlays].reverse().find((o) => Math.abs(o.x - p.x) < 0.08 && Math.abs(o.y - p.y) < 0.08);
    if (hit) { setSelectedOverlay(hit.id); draggingRef.current = hit.id; try { canvasRef.current.setPointerCapture(e.pointerId); } catch (err) {} }
    else setSelectedOverlay(null);
  }
  function onCanvasMove(e) {
    const id = draggingRef.current; if (id == null) return;
    const p = overlayPoint(e); updateOverlay(id, { x: Math.min(1, Math.max(0, p.x)), y: Math.min(1, Math.max(0, p.y)) });
  }
  function onCanvasUp(e) { if (draggingRef.current != null) { draggingRef.current = null; try { canvasRef.current.releasePointerCapture(e.pointerId); } catch (err) {} } }
  useEffect(() => {
    const onKey = (e) => {
      const t = e.target.tagName; if (t === 'INPUT' || t === 'TEXTAREA' || t === 'SELECT') return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); return; }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') { e.preventDefault(); redo(); return; }
      if (e.code === 'Space') { e.preventDefault(); togglePlay(); }
      else if (e.key === 'ArrowLeft' && !e.shiftKey) { e.preventDefault(); stepFrame(-2); }
      else if (e.key === 'ArrowRight' && !e.shiftKey) { e.preventDefault(); stepFrame(2); }
      else if (e.key === 'ArrowLeft' && e.shiftKey) { e.preventDefault(); commit(); setInPoint(current); setNotice(`In point ${time(current)}`); }
      else if (e.key === 'ArrowRight' && e.shiftKey) { e.preventDefault(); commit(); setOutPoint(current); setNotice(`Out point ${time(current)}`); }
      else if (e.key === 'Delete' && selectedOverlay != null) { removeOverlay(selectedOverlay); }
      else if (e.key.toLowerCase() === 'f') { toggleFullscreen(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  function toggleFullscreen() {
    const el = canvasRef.current; if (!el) return;
    if (!document.fullscreenElement) { if (el.requestFullscreen) el.requestFullscreen(); setFullscreen(true); }
    else { if (document.exitFullscreen) document.exitFullscreen(); setFullscreen(false); }
  }

  function buildPlan() {
    return {
      name,
      resolution: { w: res.w, h: res.h },
      trim: { start: inPoint, end: outPoint },
      adjustments,
      cuts,
      overlays,
      speed,
      volume,
      audio: audioClips.map((c) => ({ id: c.id, title: c.title, url: c.url, start: c.start, trimIn: c.trimIn, trimOut: c.trimOut, volume: c.volume, muted: c.muted, duration: c.duration })),
      music: music ? { id: music.id, title: music.title, artist: music.artist, url: music.url } : null,
    };
  }

  function applyPlan(plan) {
    if (!plan) return;
    setBrightness(plan.adjustments?.brightness ?? 100); setContrast(plan.adjustments?.contrast ?? 100);
    setSaturation(plan.adjustments?.saturation ?? 100); setHue(plan.adjustments?.hue ?? 0);
    setGrayscale(plan.adjustments?.grayscale ?? 0); setBlur(plan.adjustments?.blur ?? 0);
    setCuts(plan.cuts || []); setInPoint(plan.trim?.start ?? 0); setOutPoint(plan.trim?.end ?? duration);
    setOverlays(plan.overlays || []); setSelectedOverlay(null);
    setSpeed(plan.speed ?? 1); setVolume(plan.volume ?? 100);
    setAudioClips((plan.audio || []).map((c) => ({ ...c, url: c.url || '' }))); setSelectedAudio(null); setPreviewId(null);
    if (plan.resolution?.w) setRes({ w: plan.resolution.w, h: plan.resolution.h });
    if (plan.music?.url) { setMusic(plan.music); setMusicOn(true); } else { setMusic(null); setMusicOn(false); }
  }

  function saveProject() {
    const plan = buildPlan();
    const objectUrl = URL.createObjectURL(new Blob([JSON.stringify(plan, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a'); a.href = objectUrl; a.download = `${name || 'video-project'}.json`; a.click();
    URL.revokeObjectURL(objectUrl); setNotice('Project plan downloaded as JSON — import it any time.');
  }

  function importProject(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try { applyPlan(JSON.parse(reader.result)); setNotice('Project imported ✓ — re-import your source video to keep editing.'); }
      catch { setNotice('Import failed: the file is not a valid project plan.'); }
    };
    reader.readAsText(file);
    event.target.value = '';
  }

  async function refreshCloudProjects() {
    if (!user) return;
    try { setCloudProjects(await getCloudProjects(user.id)); }
    catch (err) { /* offline is fine */ }
  }
  useEffect(() => { refreshCloudProjects(); }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function saveToCloud() {
    if (!user) { setNotice('Sign in to save to the cloud.'); return; }
    setCloudSaving(true);
    try {
      await saveCloudProject({ userId: user.id, name, data: buildPlan() });
      await refreshCloudProjects();
      setNotice(`Saved to cloud ✓ (“${name}”) — continue from any device.`);
    } catch (err) { setNotice('Cloud save failed: ' + err.message); }
    finally { setCloudSaving(false); }
  }

  async function loadCloudProject(id) {
    try {
      const project = await getCloudProject(id);
      applyPlan(project.data);
      setName(project.data?.name || project.name);
      setNotice('Cloud project loaded ✓ — re-import your source video to keep editing.');
    } catch (err) { setNotice('Could not load cloud project: ' + err.message); }
  }

  async function removeCloudProject(id) {
    try { await deleteCloudProject(id); await refreshCloudProjects(); setNotice('Cloud project deleted.'); }
    catch (err) { setNotice('Could not delete: ' + err.message); }
  }

  const waitFor = (video, event) => new Promise((res, rej) => {
    const timer = setTimeout(() => { video.removeEventListener(event, done); rej(new Error('Timed out')); }, 10000);
    function done() { clearTimeout(timer); video.removeEventListener(event, done); res(); }
    video.addEventListener(event, done);
  });

  async function exportVideo() {
    const video = videoRef.current; const canvas = canvasRef.current;
    if (!video || !enabled || !canvas) return;
    setExporting(true); setPlaying(false);
    try {
      video.pause(); video.playbackRate = 1; video.muted = false;
      video.currentTime = inPoint; await waitFor(video, 'seeked');
      drawFrame();
      const stream = canvas.captureStream(30);
      // Mix in background music audio when enabled.
      const audioEl = musicRef.current;
      if (musicOn && audioEl && audioEl.captureStream) {
        try { audioEl.muted = false; audioEl.captureStream().getAudioTracks().forEach((t) => stream.addTrack(t)); }
        catch (err) { console.warn('Could not capture music audio.', err); }
      }
      // Mix in added audio clips (each is scheduled to sound inside its own window).
      audioClips.forEach((clip) => {
        const el = audioNodeRefs.current[clip.id];
        if (el && el.captureStream) {
          try { el.muted = false; el.captureStream().getAudioTracks().forEach((t) => stream.addTrack(t)); }
          catch (err) { console.warn('Could not capture audio clip.', err); }
        }
      });
      // Mix in the imported video's own audio track.
      if (video.captureStream) {
        try { (video.captureStream().getAudioTracks() || []).forEach((t) => stream.addTrack(t)); }
        catch (err) { console.warn('Could not capture video audio.', err); }
      }
      const types = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'];
      const mime = types.find((t) => MediaRecorder.isTypeSupported(t)) || '';
      const hd = res.w * res.h >= 1920 * 1080;
      const opts = { videoBitsPerSecond: hd ? 12000000 : 8000000 }; if (mime) opts.mimeType = mime;
      const recorder = new MediaRecorder(stream, opts);
      const chunks = [];
      recorder.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data); };
      const stopped = new Promise((res) => { recorder.onstop = res; });
      recorder.start();
      if (audioEl && musicOn) { audioEl.currentTime = 0; audioEl.play().catch(() => {}); }
      await video.play();
      await new Promise((res, rej) => {
        const timer = setTimeout(() => rej(new Error('Export timed out')), 60000);
        const poll = () => {
          syncAudioClips(video.currentTime, true);
          if (video.currentTime >= outPoint - 0.01 || video.ended || video.paused) { clearTimeout(timer); res(); }
          else requestAnimationFrame(poll);
        };
        poll();
      });
      recorder.stop(); await stopped;
      stream.getTracks().forEach((t) => t.stop());
      const blob = new Blob(chunks, { type: mime ? mime.split(';')[0] : 'video/webm' });
      const exportUrl = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = exportUrl; a.download = `${name || 'video'}_${res.w}x${res.h}.webm`; a.click();
      URL.revokeObjectURL(exportUrl);
      setNotice(`Exported ${(blob.size / 1048576).toFixed(1)} MB @ ${res.w}×${res.h}. (WebM — remux to MP4 if needed.)`);
    } catch (err) { setNotice('Export failed: ' + err.message); }
    finally {
      setExporting(false);
      pauseClips();
      if (musicRef.current && musicOn) musicRef.current.pause();
      if (videoRef.current) { videoRef.current.muted = muted; videoRef.current.volume = volume / 100; videoRef.current.playbackRate = speed; }
    }
  }

  // The server returns `{ ...user, token }` on signup/login. The token has to
  // be handed to api.js or every authenticated request (cloud projects, admin)
  // goes out without an Authorization header and is rejected with 401.
  const authed = (u) => {
    setSessionToken(u?.token);
    setUser(u);
    setHistory([]);
    setRoute('home');
  };
  const logout = () => {
    clearSessionToken();
    setUser(null);
    setHistory([]);
    setRoute('signin');
  };
  // Password-reset screen (deep-linked from the email). Runs before the auth
  // checks so it works for signed-out visitors; on completion the query string
  // token is removed and the user is taken to the sign-in screen.
  if (resetToken) {
    const finishReset = () => {
      setResetToken(null);
      const params = new URLSearchParams(window.location.search);
      params.delete('reset');
      const qs = params.toString();
      window.history.replaceState({}, '', window.location.pathname + (qs ? `?${qs}` : ''));
      setRoute('signin');
    };
    return <ResetPassword token={resetToken} onDone={finishReset} />;
  }
  if (!user) {
    if (route === 'home') return <Site onLogin={() => go('signin')} onSignUp={() => go('signup')} onOpenEditor={() => go('signup')} onLogout={() => {}} onBack={back} canGoBack={canGoBack} />;
    if (route === 'signup') return <SignUp onAuthed={authed} onSignIn={() => go('signin')} onBrowse={() => go('home')} />;
    return <SignIn onAuthed={authed} onSignUp={() => go('signup')} onBrowse={() => go('home')} />;
  }
  // Logged-in users land on the website; admin/editor are one click away.
  if (route === 'home') {
    return <Site user={user} onOpenEditor={() => go('editor')} onOpenAdmin={() => go('admin')} onLogout={logout} onBack={back} canGoBack={canGoBack} />;
  }
  if (route === 'admin') {
    return <AdminPanel user={user} onViewSite={() => setRoute('home')} onOpenEditor={() => go('editor')} onBack={back} canGoBack={canGoBack} />;
  }

  const selected = overlays.find((o) => o.id === selectedOverlay) || null;

  return <div className="editor-shell">
    <header className="editor-header">
      <div className="editor-left">
        <button className="btn-back" onClick={back} aria-label="Back" title="Back">←</button>
        <div className="brand"><Logo />VidioCut</div>
      </div>
      <input className="project-name" value={name} onChange={(e) => setName(e.target.value)} aria-label="Project name" />
      <div className="header-actions">
        <button className="icon" onClick={() => importPlanRef.current?.click()} title="Import project (JSON)">⇪</button>
        <input ref={importPlanRef} type="file" accept=".json,application/json" style={{ display: 'none' }} onChange={importProject} />
        <button className="icon" disabled={!enabled} onClick={undo} title="Undo (Ctrl+Z)">↺</button>
        <button className="icon" disabled={!enabled} onClick={redo} title="Redo (Ctrl+Y)">↻</button>
        <button className="save-button" disabled={!enabled} onClick={saveProject}>⬇ JSON</button>
        <button className={`save-button cloud${cloudSaving ? ' busy' : ''}`} disabled={cloudSaving} onClick={saveToCloud} title="Save unfinished project to the cloud"><i className="btn-spinner" aria-hidden="true" />{cloudSaving ? 'Saving…' : '☁ Save'}</button>
        <button className={`export-button${exporting ? ' busy' : ''}`} disabled={!enabled || exporting} onClick={exportVideo}><i className="btn-spinner" aria-hidden="true" />{exporting ? 'Exporting…' : `Export ${res.w}×${res.h}`}</button>
      </div>
    </header>
    <main className="editor-main">
      <aside className="media-panel">
        <h2>Media</h2>
        <label className="import-button"><input ref={filesRef} type="file" accept="video/*" onChange={importVideo} />＋ Import video</label>
        <p>Your video stays on this device. Everything else is saved in the cloud.</p>
        {enabled && <div className="asset">▣ {name}</div>}
        <Library
          enabled={enabled}
          onAddTemplate={addTemplateText}
          onAddSticker={addSticker}
          onPickMusic={pickMusic}
          onToggleMusic={toggleMusic}
          musicOn={musicOn}
          music={music}
          projects={cloudProjects}
          onSaveProject={saveToCloud}
          onOpenProject={loadCloudProject}
          onRemoveProject={removeCloudProject}
          cloudSaving={cloudSaving}
        />
        <h2>Overlays</h2>
        <button className="add-text" disabled={!enabled} onClick={addOverlay}>＋ Add text</button>
        <div className="overlay-list">{overlays.map((o) => {
          const label = o.kind === 'sticker' ? `${o.glyph} Sticker` : (o.text || 'Text');
          return <div key={o.id} className={o.id === selectedOverlay ? 'overlay sel' : 'overlay'} onClick={() => setSelectedOverlay(o.id)}><span className="overlay-text">{label}</span>{isAnimated(o) && <em className="ml-auto shrink-0 rounded-pill border border-solid border-accent/40 bg-accent/10 px-1.5 py-0.5 text-[9px] font-extrabold uppercase not-italic tracking-[0.06em] text-accent">{animationLabel(o.anim)}</em>}</div>;
        })}</div>
      </aside>      <section className="workspace">
        <div className="preview" onPointerDown={onCanvasDown} onPointerMove={onCanvasMove} onPointerUp={onCanvasUp} onPointerLeave={onCanvasUp}>
          {enabled ? <>
            <canvas ref={canvasRef} width={res.w} height={res.h} className="stage" />
            <video ref={videoRef} src={url} onLoadedMetadata={loaded} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} preload="auto" playsInline style={{ position: 'fixed', top: 0, left: '-99999px', width: 1, height: 1, pointerEvents: 'none' }} />
            <audio ref={musicRef} loop preload="auto" style={{ display: 'none' }} />
            {audioClips.map((c) => (<audio key={c.id} ref={(el) => { audioNodeRefs.current[c.id] = el; }} src={c.url} preload="auto"
              onLoadedMetadata={(e) => { const d = e.target.duration; if (Number.isFinite(d) && d > 0) setAudioClips((prev) => prev.map((x) => (x.id === c.id ? { ...x, duration: d, trimOut: Number.isFinite(x.trimOut) && x.trimOut > d ? d : x.trimOut } : x))); }}
              onEnded={() => setPreviewId(null)}
              style={{ display: 'none' }} />))}
            <button className="fs" onClick={toggleFullscreen} title="Fullscreen (F)">{fullscreen ? '⤡' : '⛶'}</button>
          </> : <div className="empty"><span>▶</span><h1>Start a new cut</h1><p>Import an MP4, WebM, or MOV video to edit here.</p><button className="pick" onClick={() => filesRef.current?.click()}>Choose a video</button></div>}
        </div>
        <p className="notice" key={notice}>{notice}</p>
        <div className="transport">
          <button disabled={!enabled} onClick={() => stepFrame(-1)} title="Previous frame">⏮</button>
          <button disabled={!enabled} onClick={togglePlay} title="Play / Pause (Space)">{playing ? '❚❚' : '▶'}</button>
          <button disabled={!enabled} onClick={() => stepFrame(1)} title="Next frame">⏭</button>
          <input type="range" min="0" max={duration || 1} step="0.01" value={current} onChange={(e) => seek(e.target.value)} disabled={!enabled} className="scrobble" />
          <span className="counter">{time(current)} / {time(duration)}</span>
        </div>
        <CutTools current={current} duration={duration} cuts={cuts} onCut={addCut} onRemove={removeCut} />
        <section className="timeline">
          <div className="timeline-title"><b>Timeline</b><span>{time(inPoint)} — {time(outPoint)} <em>({time(outPoint - inPoint)})</em></span></div>
          <div className="trim">
            <label>In <b>{time(inPoint)}</b><input type="range" min="0" max={duration || 1} step="0.1" value={inPoint} disabled={!enabled} onChange={(e) => { commit(); const next = Math.min(Number(e.target.value), outPoint - .1); setInPoint(Math.max(0, next)); if (current < next) seek(next); }} /></label>
            <span className="dur">{time(outPoint - inPoint)}</span>
            <label>Out <b>{time(outPoint)}</b><input type="range" min="0" max={duration || 1} step="0.1" value={outPoint} disabled={!enabled} onChange={(e) => { commit(); const next = Math.max(Number(e.target.value), inPoint + .1); setOutPoint(Math.min(duration, next)); if (current > next) seek(next); }} /></label>
          </div>
        </section>
      </section>
      <aside className="inspector">
        <h2>Project</h2>
        <label className="res-select">Export resolution
          <select value={RESOLUTIONS.findIndex((r) => r.w === res.w && r.h === res.h)} onChange={(e) => { const r = RESOLUTIONS[Number(e.target.value)]; setRes({ w: r.w, h: r.h }); setNotice(`Resolution: ${r.label} (${r.w}×${r.h}) — video exports are recorded at this size.`); }}>
            {RESOLUTIONS.map((r, i) => <option key={r.label} value={i}>{r.label} — {r.w}×{r.h}</option>)}
          </select>
        </label>
        <h2>Music</h2>
        <div className="volume"><label>{music ? music.title : 'None — pick from Library'}</label><button onClick={toggleMusic} disabled={!music} title="Play / pause background music">{musicOn ? '❚❚' : '▶'}</button></div>
        {music && <button className="danger" onClick={stopMusic}>Remove music</button>}
        <h2>Audio</h2>
        <button className="add-text" onClick={() => audioImportRef.current?.click()} disabled={!enabled}>＋ Import audio file</button>
        <input ref={audioImportRef} type="file" accept="audio/*" style={{ display: 'none' }} onChange={importAudio} />
        <button className="add-text" onClick={toggleAudioLibrary} disabled={!enabled}>{audioLibShown ? '－ Hide Library' : '＋ Add from Library'}</button>
        {audioLibShown && <div className="audio-lib">{audioTracks.length === 0 ? <p className="hint">Loading…</p> : audioTracks.map((tr) => (<button key={tr.id} type="button" className="lib-add" onClick={() => addAudioFromTrack(tr)}>{tr.title}{tr.artist ? ' — ' + tr.artist : ''}</button>))}</div>}
        {audioClips.length === 0 ? <p className="hint">No audio clips yet — import a file or add one from the Library. Each clip starts at the playhead.</p> : <div className="audio-list">{audioClips.map((c) => {
          const sel = c.id === selectedAudio;
          const previewing = previewId === c.id && audioNodeRefs.current[c.id] && !audioNodeRefs.current[c.id].paused;
          return (
            <div key={c.id} className={sel ? 'clip sel' : 'clip'} onClick={() => setSelectedAudio(c.id)}>
              <div className="clip-head"><b>{c.title}</b><button className="mini" onClick={(e) => { e.stopPropagation(); previewAudio(c.id); }} title="Preview clip">{previewing ? '❚❚' : '▶'}</button></div>
              <div className="row">
                <label>Start at <input type="number" step="0.1" min="0" max={outPoint || 1} value={Number(c.start.toFixed(2))} onChange={(e) => updateAudio(c.id, { start: Math.max(0, Number(e.target.value)) })} /></label>
                <button className="mini" onClick={(e) => { e.stopPropagation(); moveAudioToPlayhead(c.id); }} title="Move to playhead">⌖</button>
              </div>
              <div className="row trim-row">
                <button className="mini" onClick={(e) => { e.stopPropagation(); setSelectedAudio(c.id); markAudioTrim('in'); }} title="Set clip start at playhead">Trim In {time(current)}</button>
                <button className="mini" onClick={(e) => { e.stopPropagation(); setSelectedAudio(c.id); markAudioTrim('out'); }} title="Set clip end at playhead">Trim Out {time(current)}</button>
              </div>
              {sel && <p className="clip-trim">Keeps {time(c.trimIn)} → {time(c.trimOut)}{Number.isFinite(c.duration) ? ' of ' + time(c.duration) : ''}</p>}
              <div className="volume"><label>Vol</label><input type="range" min="0" max="100" value={c.volume} onChange={(e) => updateAudio(c.id, { volume: Number(e.target.value) })} onClick={(e) => e.stopPropagation()} /><button className="mini" onClick={(e) => { e.stopPropagation(); updateAudio(c.id, { muted: !c.muted }); }} title="Mute this clip">{c.muted ? '🔇' : '🔊'}</button></div>
              <button className="danger" onClick={(e) => { e.stopPropagation(); removeAudio(c.id); }}>✂ Cut this audio</button>
            </div>
          );
        })}</div>}
        <h2>Color</h2>
        <Control label="Brightness" value={brightness} onChange={setBrightness} disabled={!enabled} min={0} max={200} />
        <Control label="Contrast" value={contrast} onChange={setContrast} disabled={!enabled} min={0} max={200} />
        <Control label="Saturation" value={saturation} onChange={setSaturation} disabled={!enabled} min={0} max={200} />
        <Control label="Hue" value={hue} onChange={setHue} disabled={!enabled} min={0} max={360} step={1} unit="deg" />
        <Control label="Grayscale" value={grayscale} onChange={setGrayscale} disabled={!enabled} min={0} max={100} />
        <Control label="Blur" value={blur} onChange={setBlur} disabled={!enabled} min={0} max={10} step={0.1} unit="px" />
        <button className="reset" disabled={!enabled} onClick={() => { commit(); setBrightness(100); setContrast(100); setSaturation(100); setHue(0); setGrayscale(0); setBlur(0); }}>Reset adjustments</button>
        <h2>Playback</h2>
        <Control label="Speed" value={speed} onChange={updateSpeed} disabled={!enabled} min={0.25} max={3} step={0.25} unit="x" />
        <div className="volume"><label>Volume</label><input type="range" min="0" max="100" value={volume} onChange={(e) => updateVolume(Number(e.target.value))} disabled={!enabled} /><button onClick={toggleMute} disabled={!enabled} title="Mute">{muted ? '🔇' : '🔊'}</button></div>
        {selected && <div className="overlay-editor">
          <h2>{selected.kind === 'sticker' ? 'Sticker' : 'Text layer'}</h2>
          {selected.kind === 'sticker' ? <div className="row">
            <label>Size <input type="range" min="20" max="200" value={selected.size} onChange={(e) => updateOverlay(selected.id, { size: Number(e.target.value) })} /></label>
          </div> : <>
            <input className="text-tag" value={selected.text} onChange={(e) => updateOverlay(selected.id, { text: e.target.value })} />
            <div className="row">
              <label>Size <input type="range" min="14" max="120" value={selected.size} onChange={(e) => updateOverlay(selected.id, { size: Number(e.target.value) })} /></label>
              <label>Color <input type="color" value={selected.color} onChange={(e) => updateOverlay(selected.id, { color: e.target.value })} /></label>
            </div>
          </>}
          <div className="anim-picker">
            <label className="anim-row">Animation
              <select value={selected.anim || 'none'} onChange={(e) => setAnimation(selected.id, e.target.value)}>
                {OVERLAY_ANIMATIONS.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
              </select>
            </label>
            {isAnimated(selected) && <>
              <label className="anim-row">Duration <b>{animDuration(selected).toFixed(1)}s</b>
                <input type="range" min="0.2" max="3" step="0.1" value={animDuration(selected)} onChange={(e) => updateOverlay(selected.id, { animDur: Number(e.target.value) })} />
              </label>
              <label className="anim-row">Delay <b>{animDelay(selected).toFixed(1)}s</b>
                <input type="range" min="0" max="5" step="0.1" value={animDelay(selected)} onChange={(e) => updateOverlay(selected.id, { animDelay: Number(e.target.value) })} />
              </label>
              <p className="anim-hint">Starts at the in point ({time(inPoint)}) — press ▶ to preview, and the motion is saved in the export.</p>
            </>}
          </div>
          <button className="danger" onClick={() => removeOverlay(selected.id)}>Delete</button>
        </div>}
      </aside>
    </main>
    <ChatBot />
  </div>;
}

export default App;