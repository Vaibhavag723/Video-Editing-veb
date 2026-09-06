-- Seed data for the creative libraries (only inserted if tables are empty).

INSERT INTO text_templates (title, content, font_size, color, font, category) VALUES
  ('Big Title', 'YOUR MOMENT ✦', 72, '#00f0c8', 'Inter', 'title'),
  ('Neon Fade', 'NOW SHOWING', 64, '#4c8dff', 'serif',    'title'),
  ('Chunky',    'NEW DROP',      80, '#ff5a5a', 'Arial Black', 'title'),
  ('Caption',   'Add your subtitle here', 36, '#ffffff', 'Inter', 'caption'),
  ('Split',     'LEFT / RIGHT',  40, '#b06bff', 'monospace', 'caption'),
  ('Quote',     '“ Stay curious ”', 48, '#ffd166', 'serif', 'quote');

INSERT INTO stickers (name, glyph, size, category) VALUES
  ('Sparkle',  '✨', 64, 'mood'),
  ('Fire',     '🔥', 64, 'energy'),
  ('Boom',     '💥', 70, 'energy'),
  ('Heart',    '❤️', 64, 'mood'),
  ('Star',     '⭐', 56, 'mood'),
  ('Sun',      '☀️', 64, 'nature'),
  ('Party',    '🎉', 64, 'celebrate'),
  ('Crown',    '👑', 56, 'celebrate'),
  ('Bolt',     '⚡', 56, 'energy'),
  ('Rocket',   '🚀', 64, 'celebrate'),
  ('Rainbow',  '🌈', 64, 'nature'),
  ('Shades',   '😎', 64, 'mood');

INSERT INTO music (title, artist, url, duration, category) VALUES
  ('Chill Loop',   'SoundHelix', 'https://www.soundhelix.com/assets/audio/examples/soundhelix-simple-1.mp3', 40, 'chill'),
  ('Groove',       'SoundHelix', 'https://www.soundhelix.com/assets/audio/examples/soundhelix-simple-3.mp3', 40, 'upbeat'),
  ('Energetic',    'SoundHelix', 'https://www.soundhelix.com/assets/audio/examples/soundhelix-simple-5.mp3', 40, 'upbeat'),
  ('Dreamy Pad',   'SoundHelix', 'https://www.soundhelix.com/assets/audio/examples/soundhelix-simple-9.mp3', 40, 'chill'),
  ('Cinematic',    'SoundHelix', 'https://www.soundhelix.com/assets/audio/examples/soundhelix-simple-11.mp3', 40, 'score');