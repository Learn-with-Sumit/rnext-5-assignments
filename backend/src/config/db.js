const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const { MEMORY_DB, resetMemoryDb } = require('./memoryDb');

// Database file path configuration
const dbPath = process.env.DB_PATH || process.env.DB_FILE || path.join(__dirname, '../../database/bookshelf.db');
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

let isDbReady = false;

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    isDbReady = false;
    console.warn(`ℹ️ SQLite database could not be opened: ${err.message}. Running with in-memory persistence layer.`);
  } else {
    db.run('PRAGMA foreign_keys = ON;', () => {
      db.get("SELECT count(*) as count FROM sqlite_master WHERE type='table' AND name='books'", (checkErr, row) => {
        if (!checkErr && row && row.count > 0 && process.env.USE_IN_MEMORY !== 'true') {
          isDbReady = true;
          console.log(`✅ Connected to SQLite database successfully: ${path.relative(process.cwd(), dbPath)}`);
        } else if (process.env.USE_IN_MEMORY !== 'true') {
          // Auto-initialize schema & seed from database/schema.sql and database/seed.sql
          const schemaPath = path.join(__dirname, '../../database/schema.sql');
          const seedPath = path.join(__dirname, '../../database/seed.sql');
          if (fs.existsSync(schemaPath) && fs.existsSync(seedPath)) {
            const schemaSql = fs.readFileSync(schemaPath, 'utf8');
            const seedSql = fs.readFileSync(seedPath, 'utf8');
            db.exec(`${schemaSql}\n${seedSql}`, (initErr) => {
              if (!initErr) {
                isDbReady = true;
                console.log(`✅ SQLite database auto-initialized and seeded: ${path.relative(process.cwd(), dbPath)}`);
              } else {
                isDbReady = false;
                console.warn('ℹ️ SQLite auto-init failed, running with in-memory persistence layer.');
              }
            });
          } else {
            isDbReady = false;
          }
        } else {
          isDbReady = false;
        }
      });
    });
  }
});

/**
 * Universal query runner: translates $1, $2 placeholders to ? for SQLite
 * Returns { rows, rowCount, lastID, changes }
 */
const query = (text, params = []) => {
  return new Promise((resolve, reject) => {
    const normalizedText = text.replace(/\$\d+/g, '?');
    const trimmed = normalizedText.trim().toUpperCase();

    if (trimmed.startsWith('SELECT') || trimmed.startsWith('PRAGMA')) {
      db.all(normalizedText, params, (err, rows) => {
        if (err) return reject(err);
        resolve({ rows: rows || [], rowCount: (rows || []).length });
      });
    } else {
      db.run(normalizedText, params, function (err) {
        if (err) return reject(err);
        resolve({
          rows: [],
          rowCount: this.changes,
          lastID: this.lastID,
          changes: this.changes
        });
      });
    }
  });
};

const all = (text, params = []) => {
  return new Promise((resolve, reject) => {
    const normalizedText = text.replace(/\$\d+/g, '?');
    db.all(normalizedText, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows || []);
    });
  });
};

const get = (text, params = []) => {
  return new Promise((resolve, reject) => {
    const normalizedText = text.replace(/\$\d+/g, '?');
    db.get(normalizedText, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
};

const run = (text, params = []) => {
  return new Promise((resolve, reject) => {
    const normalizedText = text.replace(/\$\d+/g, '?');
    db.run(normalizedText, params, function (err) {
      if (err) return reject(err);
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

const exec = (sql) => {
  return new Promise((resolve, reject) => {
    db.exec(sql, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
};

const close = () => {
  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) return reject(err);
      isDbReady = false;
      resolve();
    });
  });
};

module.exports = {
  db,
  query,
  all,
  get,
  run,
  exec,
  close,
  pool: { end: close },
  MEMORY_DB,
  resetMemoryDb,
  isDbActive: () => isDbReady,
  isSqliteActive: () => isDbReady,
  isPostgresActive: () => isDbReady
};
