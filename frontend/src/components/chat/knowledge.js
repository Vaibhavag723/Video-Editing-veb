// --------------------------------------------------------------
// VidioCut ChatBot knowledge base — a self-contained, offline
// "assistant" that understands the editor functions and guides
// users through creating videos (no external AI key needed).
// --------------------------------------------------------------

// The step-by-step plan to create a video in VidioCut.
export const VIDEO_STEPS = [
  { title: 'Import a video', detail: 'Click "＋ Import video" in the Media panel (MP4, WebM, or MOV). Your footage stays on your device.' },
  { title: 'Trim your clip', detail: 'Drag the In and Out markers under the preview to keep only the part you want.' },
  { title: 'Cut into segments', detail: 'Use the Cut tools to split at the playhead and delete mistakes.' },
  { title: 'Add text & stickers', detail: 'Open the Creative Library → Text or Stickers, or click "＋ Add text".' },
  { title: 'Adjust color & speed', detail: 'Use the Color panel for brightness / contrast / saturation / hue, and Playback for speed & volume.' },
  { title: 'Add background music', detail: 'Open the Creative Library → Music, pick a track, and press ▶ to play it.' },
  { title: 'Save your work', detail: 'Download a JSON plan, or sign in and hit ☁ Save to continue from any device.' },
  { title: 'Export your video', detail: 'Pick a resolution (360p / 720p / 1080p) and press "Export" to download a .webm file.' },
];

// The full feature package of the site.
export const FEATURE_PACKAGE = [
  { icon: '⇪', label: 'Import & Trim', text: 'Import MP4 / WebM / MOV and set In / Out points.' },
  { icon: '✂', label: 'Jigsaw cuts', text: 'Split clips, delete mistakes, rebuild your timeline.' },
  { icon: '🎨', label: 'Color tools', text: 'Brightness, contrast, saturation, hue, grayscale & blur.' },
  { icon: '🔤', label: 'Text overlays', text: 'Drag, resize and recolor text on the preview.' },
  { icon: '✨', label: 'Stickers', text: 'Drop fun stickers from the library.' },
  { icon: '🎵', label: 'Background music', text: 'Play any library track behind your video.' },
  { icon: '▶', label: 'Playback', text: 'Speed, volume, mute and fullscreen preview.' },
  { icon: '↺', label: 'Undo / Redo', text: 'Ctrl+Z to undo, Ctrl+Y to redo any edit.' },
  { icon: '☁', label: 'Cloud projects', text: 'Save unfinished edits and resume in any browser.' },
  { icon: '📦', label: 'JSON import/export', text: 'Export a project plan and re-import it anytime.' },
  { icon: '⬇', label: 'HD export', text: 'Export 360p, 720p or 1080p WebM right in the browser.' },
];
// Intent definitions. Each intent has keywords and the reply to show.
export const INTENTS = [
  {
    id: 'greeting',
    keywords: ['hi', 'hello', 'hey', 'hii', 'howdy', 'namaste', 'start', 'help', 'yo'],
    reply: [
      { type: 'p', text: 'Hey there! 👋 I\'m the VidioCut helper.' },
      { type: 'p', text: 'I can walk you through making a video from start to finish, or explain any tool on the site.' },
    ],
    quick: ['How do I create a video?', 'What features does this site have?', 'Guide me step by step'],
  },
  {
    id: 'steps',
    keywords: ['step by step', 'how to create', 'how do i create', 'create video', 'make a video', 'make video', 'tutorial', 'guide me', 'procedure', 'how to make', 'start editing'],
    reply: [
      { type: 'p', text: 'Here\'s the full checklist to create a video in VidioCut 🎬:' },
      { type: 'steps', items: VIDEO_STEPS.map((s) => `${s.title} — ${s.detail}`) },
      { type: 'p', text: 'Tap "Guide a step by step" and I\'ll walk you through each one.' },
    ],
    quick: ['Guide a step by step', 'What features does this site have?', 'How do I export?'],
  },
  {
    id: 'features',
    keywords: ['feature', 'what can this', 'functions', 'package', 'what does it do', 'what are the', 'list of', 'capabilities', 'tools', 'all features', 'options'],
    reply: [
      { type: 'p', text: 'VidioCut is a full CapCut-style browser video editor. Here is its feature package 📦:' },
      { type: 'features', items: FEATURE_PACKAGE },
      { type: 'p', text: 'Want a guided tour? Ask me "How do I create a video?"' },
    ],
    quick: ['How do I create a video?', 'How do I add music?', 'How do I export?'],
  },
  {
    id: 'walkthrough',
    keywords: ['walk', 'one at a time', 'guide', 'guide me step', 'where do i start', 'do first', 'start from', 'begin', 'let\'s start', 'walkthrough', 'step 1'],
    reply: [
      { type: 'p', text: 'Great — let\'s do it together! 🚀 Here is Step 1 of creating your video:' },
      { type: 'step', num: 1, text: 'Import a video — click "＋ Import video" and pick an MP4, WebM or MOV file. It stays on your device.' },
      { type: 'p', text: 'When you\'re ready, type "next" for Step 2.' },
    ],
    quick: ['next', 'Show all steps', 'What features does this site have?'],
  },
  {
    id: 'import',
    keywords: ['import', 'upload', 'add video', 'load video', 'open video', 'choose file', 'how to add'],
    reply: [
      { type: 'p', text: 'Importing a video is easy 🎞️:' },
      { type: 'features', items: [
        { icon: '＋', label: 'Import button', text: 'Click "＋ Import video" on the left Media panel.' },
        { icon: '🎞️', label: 'Formats', text: 'Choose an MP4, WebM or MOV file from your computer.' },
        { icon: '🔒', label: 'Private', text: 'Your footage stays on this device — only projects go to the cloud.' },
      ] },
      { type: 'p', text: 'Once loaded, you can trim, cut and style your clip.' },
    ],
    quick: ['How do I trim?', 'How do I create a video?', 'Export'],
  },
  {
    id: 'trim',
    keywords: ['trim', 'in point', 'out point', 'cut', 'split', 'clip', 'segment', 'jigsaw', 'shorten', 'crop'],
    reply: [
      { type: 'p', text: 'Trimming and cutting is where the magic happens ✂️:' },
      { type: 'features', items: [
        { icon: '⇤', label: 'Set In / Out', text: 'Drag the In and Out markers to keep only the part you want.' },
        { icon: '✂', label: 'Cut tools', text: 'Use the Cut panel to split at the playhead and delete unwanted parts.' },
        { icon: '⌨', label: 'Keyboard', text: 'Spacebar toggles play/pause, and cut buttons split instantly.' },
      ] },
      { type: 'p', text: 'Use the In/Out sliders under the preview and the Cut tools in the transport bar.' },
    ],
    quick: ['How do I add text?', 'Color', 'Export'],
  },
  {
    id: 'color',
    keywords: ['color', 'colour', 'filter', 'brightness', 'contrast', 'saturation', 'hue', 'grayscale', 'blur', 'adjust', 'look'],
    reply: [
      { type: 'p', text: 'Color grading is in the right-hand inspector panel 🎨:' },
      { type: 'features', items: [
        { icon: '☀', label: 'Brightness', text: 'Brighten or darken the whole clip.' },
        { icon: '◑', label: 'Contrast', text: 'Push highlights and shadows apart.' },
        { icon: '🌈', label: 'Saturation', text: 'Make colors richer or go monochrome.' },
        { icon: '🔄', label: 'Hue', text: 'Rotate the color wheel.' },
        { icon: '⬛', label: 'Grayscale', text: 'Fade color for a black-and-white look.' },
        { icon: '🌫', label: 'Blur', text: 'Add a soft focus.' },
      ] },
      { type: 'p', text: 'Each control has a slider — Reset adjustments sets everything back to normal.' },
    ],
    quick: ['Add text', 'Add music', 'Export'],
  },
  {
    id: 'text',
    keywords: ['text', 'caption', 'title', 'subtitle', 'sticker', 'emoji', 'overlay', 'font', 'label', 'type'],
    reply: [
      { type: 'p', text: 'Text and stickers make your video pop ✨:' },
      { type: 'features', items: [
        { icon: '＋', label: 'Add text', text: 'Click "＋ Add text" on the Media panel, then type on the preview.' },
        { icon: '🔤', label: 'Text templates', text: 'Open Creative Library → Text for ready-made animated titles.' },
        { icon: '✨', label: 'Stickers', text: 'Open Creative Library → Stickers for fun graphics.' },
        { icon: '🎨', label: 'Style', text: 'Resize, recolor and move any layer right on the canvas.' },
      ] },
      { type: 'p', text: 'Click a layer on the preview to select it, then edit it in the inspector.' },
    ],
    quick: ['Add music', 'Save project', 'Export'],
  },
  {
    id: 'music',
    keywords: ['music', 'song', 'audio', 'sound', 'background', 'track', 'beat', 'melody'],
    reply: [
      { type: 'p', text: 'Background music takes your edit to the next level 🎵:' },
      { type: 'features', items: [
        { icon: '🎵', label: 'Library', text: 'Open Creative Library → Music to browse free tracks.' },
        { icon: '▶', label: 'Preview', text: 'Click a track, then use ⏯ in the inspector to play / pause it.' },
        { icon: '🔊', label: 'Volume', text: 'Set the music volume and mute the clip independently.' },
      ] },
      { type: 'p', text: 'Music plays during preview and is mixed into your WebM export.' },
    ],
    quick: ['Add text', 'How do I export?', 'What features does this site have?'],
  },
  {
    id: 'export',
    keywords: ['export', 'download', 'render', 'save video', 'output', 'webm', 'mp4', '1080', '720', '360', 'resolution'],
    reply: [
      { type: 'p', text: 'Ready to share? Here\'s how to export ⬆:' },
      { type: 'features', items: [
        { icon: '⬆', label: 'Resolution', text: 'Pick 360p, 720p or 1080p in the Project panel.' },
        { icon: '🎬', label: 'Export', text: 'Click "Export 1280×720" (or your size) in the top bar.' },
        { icon: '📁', label: 'Format', text: 'You get a .webm video file — remux to MP4 if you need it.' },
      ] },
      { type: 'p', text: 'Export records the canvas frame-by-frame, so text, stickers and music are baked in.' },
    ],
    quick: ['How do I create a video?', 'What features does this site have?'],
  },
  {
    id: 'cloud',
    keywords: ['cloud', 'save', 'backup', 'sync', 'resume', 'another device', 'local', 'project'],
    reply: [
      { type: 'p', text: 'VidioCut saves your work two ways ☁️:' },
      { type: 'features', items: [
        { icon: '📦', label: 'JSON plan', text: 'Press ⬇ JSON to download your full project plan.' },
        { icon: '☁', label: 'Cloud save', text: 'Sign in and hit ☁ Save — continue from any browser.' },
        { icon: '🔁', label: 'Open / Delete', text: 'Manage saved projects from the Library → Cloud tab.' },
      ] },
      { type: 'p', text: 'Re-import your source video after loading a project to keep editing.' },
    ],
    quick: ['How do I export?', 'What features does this site have?'],
  },
  {
    id: 'playback',
    keywords: ['play', 'pause', 'speed', 'volume', 'mute', 'fullscreen', 'preview', 'frame'],
    reply: [
      { type: 'p', text: 'Playback controls let you review your cut 🎛:' },
      { type: 'features', items: [
        { icon: '▶', label: 'Play / Pause', text: 'Spacebar toggles preview.' },
        { icon: '⚡', label: 'Speed', text: '0.25x – 3x in the Playback panel.' },
        { icon: '🔊', label: 'Volume & Mute', text: 'Adjust volume or mute instantly.' },
        { icon: '⛶', label: 'Fullscreen', text: 'Press F or the fullscreen button.' },
      ] },
      { type: 'p', text: 'Hold Shift + arrows to scrub, and Ctrl+Z / Ctrl+Y to undo / redo.' },
    ],
    quick: ['Add music', 'Export', 'How do I create a video?'],
  },
  {
    id: 'auth',
    keywords: ['login', 'log in', 'signup', 'sign up', 'account', 'register', 'email', 'password', 'auth'],
    reply: [
      { type: 'p', text: 'Accounts let you save projects to the cloud 🔐:' },
      { type: 'features', items: [
        { icon: '✉', label: 'Email & password', text: 'Create an account with your name, email and a strong password.' },
        { icon: '☁', label: 'Cloud sync', text: 'Once signed in, hit ☁ Save to back up any project.' },
        { icon: '🔄', label: 'Any device', text: 'Open saved projects from any browser after login.' },
      ] },
    ],
    quick: ['How do I create a video?', 'Cloud save', 'Features'],
  },
  {
    id: 'thanks',
    keywords: ['thank', 'nice', 'great', 'awesome', 'cool', 'good', 'love', 'perfect', 'ok', 'okay', 'thx'],
    reply: [
      { type: 'p', text: 'You\'re very welcome! 😊 Anything else you\'d like to know about editing in VidioCut?' },
    ],
    quick: ['How do I create a video?', 'Add music', 'Export'],
  },
  {
    id: 'next',
    keywords: ['next', 'continue', 'more', 'and then', 'next step'],
    reply: [
      { type: 'p', text: 'Let\'s keep moving! Here is the next part of creating a video 👇' },
      { type: 'p', text: 'Step 2 — Trim your clip: set the In and Out points so you only keep the part you want.' },
      { type: 'p', text: 'Say "next" again for Step 3 (text & stickers), or ask about any tool directly.' },
    ],
    quick: ['next', 'Add color', 'Export'],
  },
  {
    id: 'bye',
    keywords: ['bye', 'goodbye', 'see you', 'later', 'quit', 'exit'],
    reply: [
      { type: 'p', text: 'Goodbye! 👋 Come back anytime — and happy editing with VidioCut ✨.' },
    ],
  },
];
// Normalise a user message for keyword matching.
export function normalise(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Find the intent that best matches a user message.
export function matchIntent(text) {
  const n = normalise(text);
  let best = null;
  let bestScore = 0;
  for (const intent of INTENTS) {
    let score = 0;
    for (const kw of intent.keywords) {
      const k = normalise(kw);
      if (n.includes(k)) score += k.length;
    }
    // Prefer 'walkthrough' when the user asks to be guided live.
    if (intent.id === 'walkthrough' && /(guide me|walk me|step by step|begin|start now)/.test(n)) score += 10;
    if (score > bestScore) {
      bestScore = score;
      best = intent;
    }
  }
  return best;
}

// Build the fallback reply when nothing matched.
export function fallbackReply() {
  return {
    reply: [
      { type: 'p', text: 'Hmm, I\'m not 100% sure about that one 🤔. You can ask me about:' },
      { type: 'features', items: FEATURE_PACKAGE.map((f) => ({ icon: f.icon, label: f.label, text: f.text })) },
      { type: 'p', text: 'For example: "How do I create a video?", "add music", or "export".' },
    ],
    quick: ['How do I create a video?', 'What features does this site have?', 'Add music'],
  };
}