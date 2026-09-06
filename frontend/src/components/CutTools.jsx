const formatTime = (seconds) => `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`;
export default function CutTools({ current, duration, cuts, onCut, onRemove }) {
  const points = [0, ...cuts, duration].filter(Number.isFinite);
  return <section className="cut-tools"><div><b>Clip cuts</b><button disabled={!duration} onClick={onCut}>Split at {formatTime(current)}</button></div>{cuts.length ? <div className="cut-list">{points.slice(0, -1).map((start, i) => <span key={start}>Clip {i + 1}: {formatTime(start)}-{formatTime(points[i + 1])}{i < cuts.length && <button onClick={() => onRemove(cuts[i])}>x</button>}</span>)}</div> : <p>Move the playhead, then split the clip.</p>}</section>;
}
