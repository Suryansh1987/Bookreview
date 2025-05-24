const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { db } = require('../db/db');
const { users } = require('../db/schema');
const { eq } = require('drizzle-orm');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authMiddleware } = require('../middleware/auth');

// POST /auth/register - Register a new user
router.post('/register', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await db.select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);
    
    if (existingUser.length) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user
    const newUser = await db.insert(users)
      .values({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        isAdmin: false,
        createdAt: new Date()
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        isAdmin: users.isAdmin
      });
    
    // Generate token
    const token = jwt.sign(
      { id: newUser[0].id, isAdmin: newUser[0].isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      token,
      user: newUser[0]
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /auth/login - Login user
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password } = req.body;
    
    // Find user
    const userResult = await db.select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);
    
    if (!userResult.length) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    const user = userResult[0];
    
    // Check password
    const passwordValid = await bcrypt.compare(password, user.password);
    
    if (!passwordValid) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Generate token
    const token = jwt.sign(
      { id: user.id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /auth/me - Get current user
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const userResult = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      bio: users.bio,
      avatar: users.avatar,
      isAdmin: users.isAdmin,
      createdAt: users.createdAt
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
    
    if (!userResult.length) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(userResult[0]);
  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;