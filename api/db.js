const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const dotenv = require("dotenv");

dotenv.config();

const dbPath = path.resolve(
    __dirname,
    process.env.DATABASE_FILE || "./eventlws.db",
);
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Failed to connect to SQLite3 database:", err.message);
    } else {
        console.log(`Connected to SQLite3 database at: ${dbPath}`);
    }
});

// Promisified database helpers
db.getAsync = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
};

db.allAsync = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

db.runAsync = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve({ lastID: this.lastID, changes: this.changes });
        });
    });
};

// Initialize Schemas
const initDb = async () => {
    await db.runAsync(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT CHECK(role IN ('attendee', 'organizer')) NOT NULL DEFAULT 'attendee',
            avatar TEXT DEFAULT '',
            bio TEXT DEFAULT '',
            website TEXT DEFAULT '',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);

    await db.runAsync(`
        CREATE TABLE IF NOT EXISTS events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            category TEXT NOT NULL,
            date_time TEXT NOT NULL,
            venue TEXT NOT NULL,
            total_seats INTEGER NOT NULL DEFAULT 50,
            price REAL NOT NULL DEFAULT 49.00,
            banner_url TEXT DEFAULT '',
            status TEXT CHECK(status IN ('draft', 'published')) NOT NULL DEFAULT 'published',
            organizer_id INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (organizer_id) REFERENCES users (id) ON DELETE CASCADE
        );
    `);

    // Schema Migration: Ensure price column exists on existing events
    try {
        const evCols = await db.allAsync("PRAGMA table_info(events)");
        const evColNames = evCols.map((c) => c.name);
        if (!evColNames.includes("price")) {
            await db.runAsync(
                "ALTER TABLE events ADD COLUMN price REAL DEFAULT 49.00",
            );
        }
    } catch (evMigErr) {
        console.warn("Events migration note:", evMigErr.message);
    }

    await db.runAsync(`
        CREATE TABLE IF NOT EXISTS registrations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            notes TEXT DEFAULT '',
            card_holder_name TEXT DEFAULT '',
            card_last4 TEXT DEFAULT '',
            card_brand TEXT DEFAULT '',
            billing_postal_code TEXT DEFAULT '',
            payment_status TEXT CHECK(payment_status IN ('paid', 'pending', 'refunded')) NOT NULL DEFAULT 'paid',
            amount_paid REAL NOT NULL DEFAULT 49.00,
            payment_method TEXT NOT NULL DEFAULT 'card',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(event_id, user_id),
            FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        );
    `);

    // Schema Migration: Ensure all payment columns exist on existing databases
    try {
        const columns = await db.allAsync("PRAGMA table_info(registrations)");
        const colNames = columns.map((c) => c.name);
        if (!colNames.includes("card_holder_name")) {
            await db.runAsync(
                "ALTER TABLE registrations ADD COLUMN card_holder_name TEXT DEFAULT ''",
            );
        }
        if (!colNames.includes("card_last4")) {
            await db.runAsync(
                "ALTER TABLE registrations ADD COLUMN card_last4 TEXT DEFAULT ''",
            );
        }
        if (!colNames.includes("card_brand")) {
            await db.runAsync(
                "ALTER TABLE registrations ADD COLUMN card_brand TEXT DEFAULT ''",
            );
        }
        if (!colNames.includes("billing_postal_code")) {
            await db.runAsync(
                "ALTER TABLE registrations ADD COLUMN billing_postal_code TEXT DEFAULT ''",
            );
        }
        if (!colNames.includes("payment_status")) {
            await db.runAsync(
                "ALTER TABLE registrations ADD COLUMN payment_status TEXT DEFAULT 'paid'",
            );
        }
        if (!colNames.includes("amount_paid")) {
            await db.runAsync(
                "ALTER TABLE registrations ADD COLUMN amount_paid REAL DEFAULT 49.00",
            );
        }
        if (!colNames.includes("payment_method")) {
            await db.runAsync(
                "ALTER TABLE registrations ADD COLUMN payment_method TEXT DEFAULT 'card'",
            );
        }
    } catch (migErr) {
        console.warn("Registration migration note:", migErr.message);
    }

    await db.runAsync(`
        CREATE TABLE IF NOT EXISTS bookmarks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(event_id, user_id),
            FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        );
    `);

    await db.runAsync(`
        CREATE TABLE IF NOT EXISTS comments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            content TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        );
    `);

    await db.runAsync(`
        CREATE TABLE IF NOT EXISTS speakers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            title TEXT NOT NULL,
            company TEXT DEFAULT '',
            bio TEXT DEFAULT '',
            photo_url TEXT DEFAULT '',
            event_id INTEGER DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE SET NULL
        );
    `);

    try {
        const countSpeakers = await db.getAsync(
            "SELECT COUNT(*) as count FROM speakers",
        );
        if (!countSpeakers || countSpeakers.count === 0) {
            await db.runAsync(`
                INSERT INTO speakers (name, title, company, bio, photo_url, event_id) VALUES
                ('Sumit Saha', 'Founder of Learn with Sumit', 'Learn with Sumit', 'Tech educator and veteran entrepreneur.', '/uploads/speakers/sumit-saha.jpg', 1),
                ('Tapash Adhikary', 'Founder of tapaScript', 'tapaScript', 'Software engineer, creator of ReactPlay & tapaScript.', '/uploads/speakers/tapash-adhikary.jpg', 1),
                ('Saad Hasan', 'Full Stack Developer', 'Independent', 'Specialist in high-scale web platforms and distributed systems.', '/uploads/speakers/saad-hasan.jpg', 1)
            `);
        }
    } catch (spkErr) {
        console.warn("Speakers init note:", spkErr.message);
    }
};

module.exports = { db, initDb };
