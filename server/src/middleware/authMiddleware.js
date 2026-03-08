const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/config');

function authMiddleware(req, res, next) {
    const authHeader = req.headers['authorization'];
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        
        if (!token) {
            console.warn('Auth failed: Token missing from Bearer header');
            return res.status(401).json({ message: 'Token missing' });
        }
        
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded;
            req.token = token;
            return next();
        }
        catch (err) {
            if (err.name === 'TokenExpiredError') {
                console.warn('Auth failed: Token expired', {
                    expiredAt: err.expiredAt,
                    timestamp: new Date().toISOString()
                });
                return res.status(401).json({ message: 'Token expired' });
            }
            console.error('Auth failed: Invalid token', {
                error: err.message,
                name: err.name
            });
            return res.status(401).json({ message: 'Invalid token' });
        }
    }
    
    console.warn('Auth failed: No authorization header or invalid format');
    return res.status(401).json({ message: 'Authorization header missing or invalid' });
}

module.exports = { authMiddleware };
