const express = require('express');
const router = express.Router();
const { body, query, validationResult } = require('express-validator');
const { db } = require('../db/db');
const { books, reviews, authors } = require('../db/schema');
const { eq, like, and, desc, sql } = require('drizzle-orm');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const { averageRating } = require('../utils/bookUtils');

// GET /books - Get paginated list of books
router.get('/', [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
  query('search').optional().isString(),
  query('genre').optional().isString(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search;
    const genre = req.query.genre;

    let conditions = [];

    if (search) {
      conditions.push(like(books.title, `%${search}%`));
    }

    if (genre) {
      conditions.push(eq(books.genre, genre));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [booksResult, totalCount] = await Promise.all([
      db.select()
        .from(books)
        .leftJoin(authors, eq(books.authorId, authors.id))
        .where(whereClause)
        .limit(limit)
        .offset(offset)
        .orderBy(desc(books.createdAt)),

      db.select({ count: sql`count(*)` })
        .from(books)
        .where(whereClause)
    ]);

    // Get ratings for each book
    const bookIds = booksResult.map(book => book.books.id);
    let ratingsMap = {};

    if (bookIds.length > 0) {
      const ratingsResult = await db.select({
        bookId: reviews.bookId,
        avgRating: sql`AVG(${reviews.rating})`,
        count: sql`COUNT(*)`
      })
        .from(reviews)
        .where(sql`${reviews.bookId} IN (${sql.join(bookIds, sql`,`)})`)
        .groupBy(reviews.bookId);

      ratingsMap = ratingsResult.reduce((acc, item) => {
        acc[item.bookId] = {
          avgRating: parseFloat(item.avgRating) || 0,
          count: parseInt(item.count)
        };
        return acc;
      }, {});
    }

    // Format the response
    const formattedBooks = booksResult.map(book => ({
      id: book.books.id,
      title: book.books.title,
      coverImage: book.books.coverImage,
      genre: book.books.genre,
      publishedDate: book.books.publishedDate,
      author: book.authors ? {
        id: book.authors.id,
        name: book.authors.name
      } : null,
      rating: ratingsMap[book.books.id] || { avgRating: 0, count: 0 }
    }));

    res.json({
      books: formattedBooks,
      pagination: {
        total: parseInt(totalCount[0].count),
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(parseInt(totalCount[0].count) / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /books/:id - Get a single book with reviews
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const bookResult = await db.select()
      .from(books)
      .leftJoin(authors, eq(books.authorId, authors.id))
      .where(eq(books.id, id))
      .limit(1);

    if (!bookResult.length) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const bookReviews = await db.select()
      .from(reviews)
      .leftJoin('users', eq(reviews.userId, 'users.id'))
      .where(eq(reviews.bookId, id))
      .orderBy(desc(reviews.createdAt));

    const formattedReviews = bookReviews.map(review => ({
      id: review.reviews.id,
      rating: review.reviews.rating,
      comment: review.reviews.comment,
      createdAt: review.reviews.createdAt,
      user: {
        id: review.users.id,
        name: review.users.name,
        avatar: review.users.avatar
      }
    }));

    const book = bookResult[0].books;
    const author = bookResult[0].authors;

    res.json({
      id: book.id,
      title: book.title,
      description: book.description,
      coverImage: book.coverImage,
      isbn: book.isbn,
      genre: book.genre,
      publishedDate: book.publishedDate,
      pageCount: book.pageCount,
      createdAt: book.createdAt,
      author: author ? {
        id: author.id,
        name: author.name,
        bio: author.bio
      } : null,
      rating: averageRating(formattedReviews),
      reviews: formattedReviews
    });
  } catch (error) {
    console.error('Error fetching book:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /books - Add a new book (admin only)
router.post('/', [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('coverImage').optional().isURL().withMessage('Cover image must be a valid URL'),
  body('isbn').optional().isString(),
  body('genre').notEmpty().withMessage('Genre is required'),
  body('publishedDate').optional().isISO8601().withMessage('Published date must be a valid date'),
  body('pageCount').optional().isInt({ min: 1 }).withMessage('Page count must be a positive integer'),
  body('authorId').notEmpty().withMessage('Author ID is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Check if author exists
    const authorExists = await db.select()
      .from(authors)
      .where(eq(authors.id, req.body.authorId))
      .limit(1);

    if (!authorExists.length) {
      return res.status(404).json({ message: 'Author not found' });
    }

    const newBook = await db.insert(books)
      .values({
        title: req.body.title,
        description: req.body.description,
        coverImage: req.body.coverImage,
        isbn: req.body.isbn,
        genre: req.body.genre,
        publishedDate: req.body.publishedDate ? new Date(req.body.publishedDate) : null,
        pageCount: req.body.pageCount,
        authorId: req.body.authorId,
        createdAt: new Date()
      })
      .returning();

    res.status(201).json(newBook[0]);
  } catch (error) {
    console.error('Error adding book:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
