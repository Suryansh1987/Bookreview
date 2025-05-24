
const { pgTable, text, timestamp, integer, boolean, uuid, varchar } = require('drizzle-orm/pg-core');
const { relations } = require('drizzle-orm');


const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  bio: text('bio'),
  avatar: text('avatar'),
  isAdmin: boolean('is_admin').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
});

const authors = pgTable('authors', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  bio: text('bio'),
  avatar: text('avatar'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
});


const books = pgTable('books', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  coverImage: text('cover_image'),
  isbn: text('isbn'),
  genre: text('genre').notNull(),
  publishedDate: timestamp('published_date'),
  pageCount: integer('page_count'),
  authorId: uuid('author_id').references(() => authors.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
});


const reviews = pgTable('reviews', {
  id: uuid('id').defaultRandom().primaryKey(),
  bookId: uuid('book_id').references(() => books.id).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  rating: integer('rating').notNull(),
  comment: text('comment'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
});


const usersRelations = relations(users, ({ many }) => ({
  reviews: many(reviews)
}));

const authorsRelations = relations(authors, ({ many }) => ({
  books: many(books)
}));

const booksRelations = relations(books, ({ one, many }) => ({
  author: one(authors, {
    fields: [books.authorId],
    references: [authors.id]
  }),
  reviews: many(reviews)
}));

const reviewsRelations = relations(reviews, ({ one }) => ({
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id]
  }),
  book: one(books, {
    fields: [reviews.bookId],
    references: [books.id]
  })
}));


module.exports = {
  users,
  authors,
  books,
  reviews,
  usersRelations,
  authorsRelations,
  booksRelations,
  reviewsRelations
};