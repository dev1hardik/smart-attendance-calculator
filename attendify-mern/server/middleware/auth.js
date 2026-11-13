const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'attendify_jwt_secret_change_in_production';

/**
 * Authentication middleware.
 * If a valid JWT Bearer token is provided, decodes and attaches user id.
 * If no token is provided (Zero-Login mode), automatically attaches a default guest session.
 */
const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = { id: decoded.id };
      return next();
    } catch (error) {
      // If token is expired or invalid, fall back to guest session
    }
  }

  // Zero-Login fallback: guest user ObjectId
  req.user = { id: '000000000000000000000001' };
  next();
};

module.exports = { protect };
