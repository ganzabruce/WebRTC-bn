export default function errorHandler(err, _req, res, _next) {
  console.error(err);
  res.status(err.status || 500).json({ error: err.code || 'INTERNAL_ERROR', message: err.message || 'Server error' });
}
