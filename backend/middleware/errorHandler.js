module.exports = function errorHandler(err, req, res, next) {
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.path}`, err);

  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Request too large' });
  }

  if (err.name === 'PrismaClientKnownRequestError') {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Already exists' });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Not found' });
    }
  }

  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message,
  });
};