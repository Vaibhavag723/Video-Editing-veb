// Frequently asked questions shown on the public FAQ page.
// Kept in one file so the page component stays about rendering, not content.
const FAQS = [
  {
    q: 'Where is my video stored?',
    a: 'Your footage never leaves your device. Import, trimming and editing all happen locally in your browser — only the edit plan (cuts, text, color, music picks) is saved to the cloud so you can keep working from another device.',
  },
  {
    q: 'Do I need an account to use VidioCut?',
    a: 'You can open the editor and try it without an account. To save unfinished projects to the cloud you just sign in — either with an email + password or instantly with the Google account you are already logged into in your browser.',
  },
  {
    q: 'How do I save my work?',
    a: 'Click the ☁ Save button in the editor header to push the current edit plan to the cloud, or ⬇ JSON to download it as a file. Any saved project can be reopened later from the Library panel on any device.',
  },
  {
    q: 'How do I sign in with my Google account?',
    a: 'On the sign-in screen click “Continue with Google”. The official button uses the account you are already logged into in your browser — no password to type. If your Google address is new to VidioCut, an account is created for you automatically.',
  },
  {
    q: 'I forgot my password. What now?',
    a: 'Click “Forgot password?” on the sign-in screen and enter your email. We will send you a one-time reset link (valid for 1 hour). Opening it lets you choose a new password; your old one stops working immediately.',
  },
  {
    q: 'What export formats do you support?',
    a: 'Every export is produced as a WebM file in your browser at up to 1080p. WebM plays everywhere on the web; if you need MP4, most editors (including CapCut and HandBrake) can remux it in seconds.',
  },
  {
    q: 'Is sharing or uploading my content safe?',
    a: 'Yes. VidioCut does not upload your video. Cloud saves contain only the edit plan — no raw footage — and every account activity is covered by the same basic protections (scrypt password hashing, per-request admin checks).',
  },
  {
    q: 'How can I ask a question or report a problem?',
    a: 'Use the “Ask a question” page (linked in the site navigation and the footer). Fill in the short form and it is delivered straight to the VidioCut team — we usually reply within 1–2 days.',
  },
];

export default FAQS;