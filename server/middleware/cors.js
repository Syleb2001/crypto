const cors = require('cors');

const corsMiddleware = cors({
  // Allow access from any origin in production
  origin: (origin, callback) => {
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
});

module.exports = corsMiddleware;