const express = require('express');
const next = require('next');
const cors = require('cors');
require('dotenv').config();

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const PORT = process.env.PORT || 3000;

// Import API routes
const booksRoutes = require('./api/routes/books');
const reviewsRoutes = require('./api/routes/reviews');
const usersRoutes = require('./api/routes/users');
const authRoutes = require('./api/routes/auth');

app.prepare().then(() => {
  const server = express();

  // Middleware
  server.use(express.json());
  server.use(cors());

  // API routes
  server.use('/api/books', booksRoutes);
  server.use('/api/reviews', reviewsRoutes);
  server.use('/api/users', usersRoutes);
  server.use('/api/auth', authRoutes);

  // Default handler for all Next.js requests
  server.all('*', (req, res) => {
    return handle(req, res);
  });

  server.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${PORT}`);
  });
}).catch((ex) => {
  console.error(ex.stack);
  process.exit(1);
});