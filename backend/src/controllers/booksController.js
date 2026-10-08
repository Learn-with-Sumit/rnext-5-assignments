const db = require('../config/db');
const { MEMORY_DB } = require('../config/memoryDb');

// GET /api/books
const getAllBooks = async (req, res, next) => {
  try {
    const { search, genre, minRating, sort } = req.query;

    if (db.isDbActive()) {
      let queryText = 'SELECT * FROM books WHERE 1=1';
      const params = [];

      if (search) {
        queryText += ' AND (LOWER(title) LIKE ? OR LOWER(author) LIKE ? OR LOWER(description) LIKE ?)';
        const searchPattern = `%${search.toLowerCase()}%`;
        params.push(searchPattern, searchPattern, searchPattern);
      }

      if (genre && genre !== 'all') {
        queryText += ' AND LOWER(genre) = LOWER(?)';
        params.push(genre);
      }

      if (minRating) {
        queryText += ' AND rating >= ?';
        params.push(parseFloat(minRating));
      }

      // Sorting
      if (sort === 'newest') {
        queryText += ' ORDER BY published_year DESC';
      } else if (sort === 'oldest') {
        queryText += ' ORDER BY published_year ASC';
      } else if (sort === 'rating') {
        queryText += ' ORDER BY rating DESC';
      } else {
        queryText += ' ORDER BY id ASC';
      }

      const result = await db.query(queryText, params);
      const formatted = result.rows.map(b => ({
        id: b.id,
        title: b.title,
        author: b.author,
        genre: b.genre,
        rating: parseFloat(b.rating),
        publishedYear: b.published_year,
        description: b.description,
        coverImage: b.cover_image,
        price: b.price
      }));

      return res.status(200).json({
        success: true,
        count: formatted.length,
        data: formatted
      });
    }

    // In-Memory Fallback
    let books = [...MEMORY_DB.books];

    if (search) {
      const q = search.toLowerCase();
      books = books.filter(b => 
        b.title.toLowerCase().includes(q) || 
        b.author.toLowerCase().includes(q) || 
        (b.description && b.description.toLowerCase().includes(q))
      );
    }

    if (genre && genre !== 'all') {
      books = books.filter(b => b.genre.toLowerCase() === genre.toLowerCase());
    }

    if (minRating) {
      books = books.filter(b => b.rating >= parseFloat(minRating));
    }

    if (sort === 'newest') {
      books.sort((a, b) => (b.publishedYear || b.published_year) - (a.publishedYear || a.published_year));
    } else if (sort === 'oldest') {
      books.sort((a, b) => (a.publishedYear || a.published_year) - (b.publishedYear || b.published_year));
    } else if (sort === 'rating') {
      books.sort((a, b) => b.rating - a.rating);
    }

    return res.status(200).json({
      success: true,
      count: books.length,
      data: books
    });

  } catch (error) {
    next(error);
  }
};

// GET /api/books/:id
const getBookById = async (req, res, next) => {
  try {
    const bookId = parseInt(req.params.id, 10);
    if (isNaN(bookId)) {
      return res.status(400).json({ success: false, message: 'Invalid book ID format.' });
    }

    if (db.isDbActive()) {
      const result = await db.query('SELECT * FROM books WHERE id = ?', [bookId]);
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: `Book with id ${bookId} not found.` });
      }
      const b = result.rows[0];
      return res.status(200).json({
        success: true,
        data: {
          id: b.id,
          title: b.title,
          author: b.author,
          genre: b.genre,
          rating: parseFloat(b.rating),
          publishedYear: b.published_year,
          description: b.description,
          coverImage: b.cover_image,
          price: b.price
        }
      });
    }

    const book = MEMORY_DB.books.find(b => b.id === bookId);
    if (!book) {
      return res.status(404).json({ success: false, message: `Book with id ${bookId} not found.` });
    }

    return res.status(200).json({ success: true, data: book });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllBooks,
  getBookById
};
