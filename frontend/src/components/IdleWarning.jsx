import { useEffect, useRef } from 'react';

// "Are you still there?" dialog shown before an idle session is signed out.
// Focus moves to the safe default (Stay signed in) so a stray Enter keeps the
// session rather than ending it.
export default function IdleWarning({ secondsLeft, onStay, onSignOut }) {
  const stayRef = useRef(null);
  useEffect(() => { stayRef.current?.focus(); }, []);

  return (
    <div className="idle-overlay" role="alertdialog" aria-modal="true" aria-labelledby="idle-title" aria-describedby="idle-desc">
      <div className="idle-dialog">
        <h2 id="idle-title">Still there?</h2>
        <p id="idle-desc">
          For your security you'll be signed out in <b>{secondsLeft}s</b> because there's been no activity.
          Unsaved edits stay in this tab until you sign back in.
        </p>
        <div className="idle-actions">
          <button type="button" className="idle-stay" ref={stayRef} onClick={onStay}>Stay signed in</button>
          <button type="button" className="idle-out" onClick={onSignOut}>Sign out now</button>
        </div>
      </div>
    </div>
  );
}
