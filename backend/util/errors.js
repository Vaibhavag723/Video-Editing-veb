// Sends a safe error response: the real error is always logged server-side
// for debugging, but the client only ever sees a generic message in
// production. Raw error messages (e.g. Postgres constraint/column details)
// can reveal schema internals, so they are only echoed back when
// NODE_ENV !== 'production', to keep local development convenient.
function sendError(res, status, err, fallback = 'Something went wrong. Please try again.') {
  if (err) console.error(err);
  const showDetail = process.env.NODE_ENV !== 'production' && err?.message;
  res.status(status).json({ error: showDetail ? err.message : fallback });
}

module.exports = { sendError };
