const db = require('../config/db');
const { MEMORY_DB } = require('../config/memoryDb');

// GET /api/genres
const getGenres = async (req, res, next) => {
  try {
    if (db.isDbActive()) {
      const result = await db.query('SELECT DISTINCT genre FROM books ORDER BY genre ASC');
      const genres = result.rows.map(r => r.genre);
      return res.status(200).json({
        success: true,
        count: genres.length,
        data: genres
      });
    }

    const uniqueGenres = [...new Set(MEMORY_DB.books.map(b => b.genre))].sort();
    return res.status(200).json({
      success: true,
      count: uniqueGenres.length,
      data: uniqueGenres
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getGenres
};
