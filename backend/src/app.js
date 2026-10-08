const express = require('express');
const cors = require('cors');
const booksRoutes = require('./routes/booksRoutes');
const genresRoutes = require('./routes/genresRoutes');
const readingListRoutes = require('./routes/readingListRoutes');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();

// Global Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check / Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'BookShelf RESTful API is operational 🚀',
    version: '1.0.0',
    endpoints: {
      books: '/api/books',
      genres: '/api/genres',
      readingList: '/api/reading-list',
      readingSummary: '/api/reading-list/summary'
    }
  });
});

// API Routes
app.use('/api/books', booksRoutes);
app.use('/api/genres', genresRoutes);
app.use('/api/reading-list', readingListRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

module.exports = app;
