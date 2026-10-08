const db = require('../config/db');
const { MEMORY_DB } = require('../config/memoryDb');

const ALLOWED_PROGRESS = [0, 25, 50, 75, 100];

// GET /api/reading-list
const getReadingList = async (req, res, next) => {
  try {
    if (db.isDbActive()) {
      const queryText = `
        SELECT 
          rl.id,
          rl.book_id AS "bookId",
          rl.progress,
          rl.added_at AS "addedAt",
          b.id AS "b_id",
          b.title AS "b_title",
          b.author AS "b_author",
          b.genre AS "b_genre",
          b.rating AS "b_rating",
          b.published_year AS "b_publishedYear",
          b.description AS "b_description",
          b.cover_image AS "b_coverImage",
          b.price AS "b_price"
        FROM reading_list rl
        JOIN books b ON rl.book_id = b.id
        ORDER BY rl.added_at DESC
      `;
      const result = await db.query(queryText);
      const formatted = result.rows.map(r => ({
        id: r.id,
        bookId: r.bookId,
        progress: r.progress,
        addedAt: r.addedAt,
        book: {
          id: r.b_id,
          title: r.b_title,
          author: r.b_author,
          genre: r.b_genre,
          rating: parseFloat(r.b_rating),
          publishedYear: r.b_publishedYear,
          description: r.b_description,
          coverImage: r.b_coverImage,
          price: r.b_price
        }
      }));

      return res.status(200).json({
        success: true,
        count: formatted.length,
        data: formatted
      });
    }

    // In Memory Fallback
    const list = MEMORY_DB.readingList.map(item => {
      const book = MEMORY_DB.books.find(b => b.id === (item.book_id || item.bookId));
      return {
        id: item.id,
        bookId: item.book_id || item.bookId,
        progress: item.progress,
        addedAt: item.added_at || item.addedAt,
        book: book ? {
          id: book.id,
          title: book.title,
          author: book.author,
          genre: book.genre,
          rating: book.rating,
          publishedYear: book.publishedYear || book.published_year,
          description: book.description,
          coverImage: book.coverImage || book.cover_image,
          price: book.price
        } : null
      };
    });

    return res.status(200).json({
      success: true,
      count: list.length,
      data: list
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/reading-list/summary
const getReadingSummary = async (req, res, next) => {
  try {
    let items = [];

    if (db.isDbActive()) {
      const result = await db.query('SELECT progress FROM reading_list');
      items = result.rows;
    } else {
      items = MEMORY_DB.readingList;
    }

    const total = items.length;
    // Currently reading: 1% to 99%
    const currentlyReading = items.filter(i => i.progress >= 1 && i.progress <= 99).length;
    // Completed: 100%
    const completed = items.filter(i => i.progress === 100).length;

    return res.status(200).json({
      success: true,
      data: {
        totalBooks: total,
        currentlyReading: currentlyReading,
        completedBooks: completed
      }
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/reading-list
const addToReadingList = async (req, res, next) => {
  try {
    const { bookId, progress = 0 } = req.body;

    if (!bookId) {
      return res.status(400).json({
        success: false,
        message: 'Field "bookId" is required.'
      });
    }

    const numericProgress = parseInt(progress, 10);
    if (!ALLOWED_PROGRESS.includes(numericProgress)) {
      return res.status(400).json({
        success: false,
        message: `Invalid progress value. Allowed values are: ${ALLOWED_PROGRESS.join(', ')}`
      });
    }

    if (db.isDbActive()) {
      // Check if book exists
      const bookCheck = await db.query('SELECT id FROM books WHERE id = ?', [bookId]);
      if (bookCheck.rows.length === 0) {
        return res.status(404).json({ success: false, message: `Book with id ${bookId} does not exist.` });
      }

      // Check if already in reading list
      const existing = await db.query('SELECT id FROM reading_list WHERE book_id = ?', [bookId]);
      if (existing.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'This book is already in your shelf.'
        });
      }

      const insertResult = await db.run(
        'INSERT INTO reading_list (book_id, progress) VALUES (?, ?)',
        [bookId, numericProgress]
      );

      const insertedRow = await db.get(
        'SELECT id, book_id AS "bookId", progress, added_at AS "addedAt" FROM reading_list WHERE id = ?',
        [insertResult.lastID]
      );

      return res.status(201).json({
        success: true,
        message: 'Book added to shelf successfully.',
        data: insertedRow
      });
    }

    // In Memory Fallback
    const book = MEMORY_DB.books.find(b => b.id === bookId);
    if (!book) {
      return res.status(404).json({ success: false, message: `Book with id ${bookId} does not exist.` });
    }

    const exists = MEMORY_DB.readingList.some(i => (i.book_id || i.bookId) === bookId);
    if (exists) {
      return res.status(409).json({ success: false, message: 'This book is already in your shelf.' });
    }

    const newItem = {
      id: Date.now(),
      bookId: bookId,
      book_id: bookId,
      progress: numericProgress,
      addedAt: new Date().toISOString(),
      added_at: new Date().toISOString()
    };
    MEMORY_DB.readingList.push(newItem);

    return res.status(201).json({
      success: true,
      message: 'Book added to shelf successfully.',
      data: newItem
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/reading-list/:id
const updateReadingProgress = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { progress } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid shelf item ID.' });
    }

    if (progress === undefined || progress === null) {
      return res.status(400).json({ success: false, message: 'Field "progress" is required.' });
    }

    const numericProgress = parseInt(progress, 10);
    if (!ALLOWED_PROGRESS.includes(numericProgress)) {
      return res.status(400).json({
        success: false,
        message: `Invalid progress value. Allowed values are: ${ALLOWED_PROGRESS.join(', ')}`
      });
    }

    if (db.isDbActive()) {
      const existing = await db.get(
        'SELECT id FROM reading_list WHERE id = ? OR book_id = ?',
        [id, id]
      );

      if (!existing) {
        return res.status(404).json({ success: false, message: `Shelf entry not found for id ${id}.` });
      }

      await db.run(
        'UPDATE reading_list SET progress = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [numericProgress, existing.id]
      );

      const updatedRow = await db.get(
        'SELECT id, book_id AS "bookId", progress, updated_at AS "updatedAt" FROM reading_list WHERE id = ?',
        [existing.id]
      );

      return res.status(200).json({
        success: true,
        message: 'Reading progress updated successfully.',
        data: updatedRow
      });
    }

    // In Memory Fallback
    const item = MEMORY_DB.readingList.find(i => i.id === id || (i.book_id || i.bookId) === id);
    if (!item) {
      return res.status(404).json({ success: false, message: `Shelf entry not found for id ${id}.` });
    }

    item.progress = numericProgress;
    item.updatedAt = new Date().toISOString();

    return res.status(200).json({
      success: true,
      message: 'Reading progress updated successfully.',
      data: item
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/reading-list/:id
const removeFromReadingList = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid shelf item ID.' });
    }

    if (db.isDbActive()) {
      const existing = await db.get(
        'SELECT id FROM reading_list WHERE id = ? OR book_id = ?',
        [id, id]
      );

      if (!existing) {
        return res.status(404).json({ success: false, message: `Shelf entry not found for id ${id}.` });
      }

      await db.run('DELETE FROM reading_list WHERE id = ?', [existing.id]);

      return res.status(200).json({
        success: true,
        message: 'Book removed from shelf successfully.'
      });
    }

    // In Memory Fallback
    const index = MEMORY_DB.readingList.findIndex(i => i.id === id || (i.book_id || i.bookId) === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: `Shelf entry not found for id ${id}.` });
    }

    MEMORY_DB.readingList.splice(index, 1);
    return res.status(200).json({
      success: true,
      message: 'Book removed from shelf successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getReadingList,
  getReadingSummary,
  addToReadingList,
  updateReadingProgress,
  removeFromReadingList
};
