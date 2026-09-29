import { useCallback, useEffect, useRef, useState } from 'react';

// Inactivity window for a signed-in session.
//
//   idleMs of no input  → a warning dialog appears
//   + warnMs more       → onTimeout() runs (the app signs the user out)
//
// "Activity" is any pointer, key, wheel or touch input. While `paused` is true
// (a video is playing or an export is running — long stretches with no input
// that are still real work) the clock is held at zero.
//
// It compares Date.now() against the last activity rather than counting timer
// ticks, so a laptop that slept for hours (timers frozen) is signed out the
// moment it wakes instead of resuming a stale session.
const ACTIVITY_EVENTS = ['pointerdown', 'pointermove', 'keydown', 'wheel', 'touchstart'];

export default function useIdleTimeout({ enabled, paused = false, idleMs, warnMs = 60 * 1000, onTimeout }) {
  const [warning, setWarning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(Math.ceil(warnMs / 1000));

  const lastActivity = useRef(Date.now());
  const warningRef = useRef(false);
  const pausedRef = useRef(paused);
  const onTimeoutRef = useRef(onTimeout);
  useEffect(() => { pausedRef.current = paused; onTimeoutRef.current = onTimeout; });

  const setWarn = (value) => { warningRef.current = value; setWarning(value); };

  // Explicit "Stay signed in" — the only thing that dismisses the warning.
  const stay = useCallback(() => {
    lastActivity.current = Date.now();
    warningRef.current = false;
    setWarning(false);
  }, []);

  useEffect(() => {
    if (!enabled) { warningRef.current = false; setWarning(false); return undefined; }
    lastActivity.current = Date.now();

    // Once the warning is showing, stray mouse movement must not silently
    // cancel it — the user has to answer the dialog.
    const mark = () => { if (!warningRef.current) lastActivity.current = Date.now(); };
    ACTIVITY_EVENTS.forEach((e) => window.addEventListener(e, mark, { passive: true }));

    const timer = setInterval(() => {
      if (pausedRef.current) { lastActivity.current = Date.now(); return; }
      const idle = Date.now() - lastActivity.current;
      if (idle >= idleMs + warnMs) {
        setWarn(false);
        onTimeoutRef.current?.();
      } else if (idle >= idleMs) {
        setWarn(true);
        setSecondsLeft(Math.max(0, Math.ceil((idleMs + warnMs - idle) / 1000)));
      }
    }, 1000);

    return () => {
      clearInterval(timer);
      ACTIVITY_EVENTS.forEach((e) => window.removeEventListener(e, mark));
    };
  }, [enabled, idleMs, warnMs]);

  return { warning, secondsLeft, stay };
}
