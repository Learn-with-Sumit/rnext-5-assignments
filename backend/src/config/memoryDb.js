const fs = require('fs');
const path = require('path');

const seedDataPath = path.join(__dirname, '../../database/seedData.json');

/**
 * Load initial data dynamically from seedData.json
 * Ensures zero hardcoded data inside the application code.
 */
const loadInitialData = () => {
  try {
    if (fs.existsSync(seedDataPath)) {
      const raw = fs.readFileSync(seedDataPath, 'utf8');
      const data = JSON.parse(raw);
      return {
        books: (data.books || []).map(b => ({
          ...b,
          publishedYear: b.publishedYear || b.published_year,
          coverImage: b.coverImage || b.cover_image
        })),
        readingList: (data.readingList || []).map(item => ({
          ...item,
          bookId: item.bookId || item.book_id,
          addedAt: item.addedAt || item.added_at
        }))
      };
    }
  } catch (error) {
    console.error('Failed to load seedData.json for in-memory store:', error.message);
  }

  return { books: [], readingList: [] };
};

const initialData = loadInitialData();

const MEMORY_DB = {
  books: JSON.parse(JSON.stringify(initialData.books)),
  readingList: JSON.parse(JSON.stringify(initialData.readingList))
};

const resetMemoryDb = () => {
  const fresh = loadInitialData();
  MEMORY_DB.books = JSON.parse(JSON.stringify(fresh.books));
  MEMORY_DB.readingList = JSON.parse(JSON.stringify(fresh.readingList));
  return MEMORY_DB;
};

module.exports = {
  MEMORY_DB,
  resetMemoryDb,
  loadInitialData
};
