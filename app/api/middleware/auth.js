const jwt = require('jsonwebtoken');
import { NextResponse } from 'next/server';

const authMiddleware = (req, res, next) => {
  try {

    const token = req.header('Authorization')?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }
  
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
  
    req.user = decoded;
    
    next();
  } catch (err) {
    console.error('Auth middleware error:', err.message);
    res.status(401).json({ message: 'Token is not valid' });
  }
};


const adminMiddleware = (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: 'Access denied: Admin only' });
  }
  
  next();
};

module.exports = { authMiddleware, adminMiddleware };