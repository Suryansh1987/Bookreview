const express = require('express');
const router = express.Router();
import { NextResponse } from 'next/server';
const { body, validationResult } = require('express-validator');
const { db } = require('../db/db');
const { users } = require('../db/schema');
const { eq } = require('drizzle-orm');
const { authMiddleware } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

// GET /users/:id - Get user profile
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const userResult = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      bio: users.bio,
      avatar: users.avatar,
      createdAt: users.createdAt
    })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);
    
    if (!userResult.length) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(userResult[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /users/:id - Update user profile
router.put('/:id', [
  authMiddleware,
  body('name').optional().isString().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('bio').optional().isString(),
  body('avatar').optional().isURL().withMessage('Avatar must be a valid URL'),
  body('currentPassword').optional().isString(),
  body('newPassword').optional().isString().isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const { name, bio, avatar, currentPassword, newPassword } = req.body;
    
    // Check if user is updating their own profile
    if (id !== req.user.id) {
      return res.status(403).json({ message: 'You can only update your own profile' });
    }
    
    // Get current user data
    const userResult = await db.select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    
    if (!userResult.length) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const currentUser = userResult[0];
    
    // Update object to be applied
    const updateData = {};
    
    if (name) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (avatar) updateData.avatar = avatar;
    
    // Handle password update if requested
    if (currentPassword && newPassword) {
      const passwordValid = await bcrypt.compare(currentPassword, currentUser.password);
      
      if (!passwordValid) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
      
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      updateData.password = hashedPassword;
    } else if ((currentPassword && !newPassword) || (!currentPassword && newPassword)) {
      return res.status(400).json({ message: 'Both current password and new password are required to update password' });
    }
    
    const updatedUser = await db.update(users)
      .set({
        ...updateData,
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        bio: users.bio,
        avatar: users.avatar,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt
      });
    
    res.json(updatedUser[0]);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /users/:id/reviews - Get user's reviews
router.get('/:id/reviews', async (req, res) => {
  try {
    const { id } = req.params;
    
    const userReviews = await db.select()
      .from('reviews')
      .leftJoin(books, eq('reviews.bookId', books.id))
      .where(eq('reviews.userId', id))
      .orderBy(desc('reviews.createdAt'));
    
    const formattedReviews = userReviews.map(review => ({
      id: review.reviews.id,
      rating: review.reviews.rating,
      comment: review.reviews.comment,
      createdAt: review.reviews.createdAt,
      book: {
        id: review.books.id,
        title: review.books.title,
        coverImage: review.books.coverImage
      }
    }));
    
    res.json(formattedReviews);
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;