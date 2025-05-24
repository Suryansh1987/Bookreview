const express = require('express');
const router = express.Router();
import { NextResponse } from 'next/server';
const { body, query, validationResult } = require('express-validator');
const { db } = require('../db/db');
const { reviews, books } = require('../db/schema');
const { eq, desc } = require('drizzle-orm');
const { authMiddleware } = require('../middleware/auth');

// GET /reviews - Get reviews (optionally filtered by bookId)
router.get('/', [
  query('bookId').optional().isString(),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { bookId } = req.query;
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const offset = (page - 1) * limit;
    
    let query = db.select()
      .from(reviews)
      .leftJoin('users', eq(reviews.userId, 'users.id'))
      .orderBy(desc(reviews.createdAt))
      .limit(limit)
      .offset(offset);
    
    if (bookId) {
      query = query.where(eq(reviews.bookId, bookId));
    }
    
    const reviewsResult = await query;
    
    const formattedReviews = reviewsResult.map(review => ({
      id: review.reviews.id,
      rating: review.reviews.rating,
      comment: review.reviews.comment,
      createdAt: review.reviews.createdAt,
      bookId: review.reviews.bookId,
      user: {
        id: review.users.id,
        name: review.users.name,
        avatar: review.users.avatar
      }
    }));
    
    res.json(formattedReviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /reviews - Submit a review
router.post('/', [
  authMiddleware,
  body('bookId').notEmpty().withMessage('Book ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().isString()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { bookId, rating, comment } = req.body;
    const userId = req.user.id;
    
    // Check if book exists
    const bookExists = await db.select()
      .from(books)
      .where(eq(books.id, bookId))
      .limit(1);
    
    if (!bookExists.length) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    // Check if user already reviewed this book
    const existingReview = await db.select()
      .from(reviews)
      .where(eq(reviews.bookId, bookId))
      .where(eq(reviews.userId, userId))
      .limit(1);
    
    if (existingReview.length) {
      return res.status(400).json({ message: 'You have already reviewed this book' });
    }
    
    const newReview = await db.insert(reviews)
      .values({
        bookId,
        userId,
        rating,
        comment: comment || '',
        createdAt: new Date()
      })
      .returning();
    
    res.status(201).json(newReview[0]);
  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /reviews/:id - Update a review
router.put('/:id', [
  authMiddleware,
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().isString()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;
    
    // Check if review exists and belongs to the user
    const existingReview = await db.select()
      .from(reviews)
      .where(eq(reviews.id, id))
      .limit(1);
    
    if (!existingReview.length) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    if (existingReview[0].userId !== userId) {
      return res.status(403).json({ message: 'You can only update your own reviews' });
    }
    
    const updatedReview = await db.update(reviews)
      .set({
        rating,
        comment: comment || existingReview[0].comment,
        updatedAt: new Date()
      })
      .where(eq(reviews.id, id))
      .returning();
    
    res.json(updatedReview[0]);
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /reviews/:id - Delete a review
router.delete('/:id', [
  authMiddleware
], async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Check if review exists and belongs to the user
    const existingReview = await db.select()
      .from(reviews)
      .where(eq(reviews.id, id))
      .limit(1);
    
    if (!existingReview.length) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    if (existingReview[0].userId !== userId) {
      return res.status(403).json({ message: 'You can only delete your own reviews' });
    }
    
    await db.delete(reviews)
      .where(eq(reviews.id, id));
    
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;