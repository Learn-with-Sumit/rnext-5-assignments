const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { db, initDb } = require("./db");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const JWT_SECRET =
    process.env.JWT_SECRET || "eventlws-super-secret-key-2026-batch5";
const JWT_REFRESH_SECRET =
    process.env.JWT_REFRESH_SECRET ||
    "eventlws-refresh-super-secret-key-2026-batch5";

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads, public assets, and dist frontend
app.use("/public", express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));
app.use(express.static(path.join(__dirname, "../dist")));

// Ensure upload directories exist for individual categories
const UPLOAD_ROOT = path.join(__dirname, "public/uploads");
const UPLOAD_DIRS = {
    profiles: path.join(UPLOAD_ROOT, "profiles"),
    speakers: path.join(UPLOAD_ROOT, "speakers"),
    events: path.join(UPLOAD_ROOT, "events"),
};
Object.values(UPLOAD_DIRS).forEach((dir) => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Configure Multer Storage for Profiles, Speakers, and Events
const createStorage = (defaultCategory = "profiles") => {
    return multer.diskStorage({
        destination: (req, file, cb) => {
            let cat = req.params.category || defaultCategory;
            if (
                ["profile", "profiles", "avatar", "user"].includes(
                    cat.toLowerCase(),
                )
            )
                cat = "profiles";
            else if (["speaker", "speakers"].includes(cat.toLowerCase()))
                cat = "speakers";
            else if (["event", "events", "banner"].includes(cat.toLowerCase()))
                cat = "events";
            else cat = "profiles";

            const dir = path.join(UPLOAD_ROOT, cat);
            fs.mkdirSync(dir, { recursive: true });
            cb(null, dir);
        },
        filename: (req, file, cb) => {
            const ext = (
                path.extname(file.originalname) || ".jpg"
            ).toLowerCase();
            const base =
                path
                    .basename(file.originalname, ext)
                    .replace(/[^a-zA-Z0-9_-]/g, "") || "upload";
            const unique = `${Date.now()}-${Math.floor(Math.random() * 1e9)}`;
            cb(null, `${base}-${unique}${ext}`);
        },
    });
};

const imageFilter = (req, file, cb) => {
    const allowed = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        "image/gif",
        "image/svg+xml",
    ];
    if (
        allowed.includes(file.mimetype) ||
        file.originalname.match(/\.(jpg|jpeg|png|webp|gif|svg)$/i)
    ) {
        cb(null, true);
    } else {
        cb(
            new Error(
                "Only valid image files (JPEG, PNG, WEBP, GIF, SVG) are allowed.",
            ),
            false,
        );
    }
};

const uploadProfile = multer({
    storage: createStorage("profiles"),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: imageFilter,
});
const uploadSpeaker = multer({
    storage: createStorage("speakers"),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: imageFilter,
});
const uploadEvent = multer({
    storage: createStorage("events"),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: imageFilter,
});
const uploadDynamic = multer({
    storage: createStorage("profiles"),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: imageFilter,
});

// Accepts any field name (avatar, photo, banner, image, file, etc.)
const createAnyUploadMiddleware = (uploader) => {
    return (req, res, next) => {
        uploader.any()(req, res, (err) => {
            if (err)
                return res
                    .status(400)
                    .json({ success: false, message: err.message });
            if (req.files && req.files.length > 0) {
                req.file = req.files[0];
            }
            next();
        });
    };
};

// Initialize DB schema on boot
initDb().catch(console.error);

// -------------------------------------------------------------
// JWT Middleware
// -------------------------------------------------------------
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res
            .status(401)
            .json({ message: "Access denied. No token provided." });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res
                .status(403)
                .json({ message: "Invalid or expired token." });
        }
        req.user = user;
        next();
    });
};

const optionalAuth = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (token) {
        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (!err) req.user = user;
            next();
        });
    } else {
        next();
    }
};

const requireRole = (role) => {
    return (req, res, next) => {
        if (!req.user || req.user.role !== role) {
            return res
                .status(403)
                .json({ message: `Forbidden. Requires ${role} role.` });
        }
        next();
    };
};

const generateTokens = (user) => {
    const payload = {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
    };
    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
    const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, {
        expiresIn: "7d",
    });
    return {
        accessToken,
        refreshToken,
        access_token: accessToken,
        refresh_token: refreshToken,
    };
};

// -------------------------------------------------------------
// AUTH ROUTES
// -------------------------------------------------------------
app.post("/api/auth/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res
                .status(400)
                .json({ message: "Name, email, and password are required." });
        }

        const existing = await db.getAsync(
            "SELECT * FROM users WHERE email = ?",
            [email],
        );
        if (existing) {
            return res
                .status(409)
                .json({ message: "User with this email already exists." });
        }

        const hash = await bcrypt.hash(password, 10);
        const result = await db.runAsync(
            'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, "attendee")',
            [name, email, hash],
        );

        const newUser = {
            id: result.lastID,
            name,
            email,
            role: "attendee",
            avatar: "",
            bio: "",
            website: "",
        };
        const tokens = generateTokens(newUser);

        res.status(201).json({
            message: "Registration successful",
            user: newUser,
            ...tokens,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post("/api/auth/register-organizer", async (req, res) => {
    try {
        const { name, email, password, website } = req.body;
        if (!name || !email || !password) {
            return res
                .status(400)
                .json({ message: "Name, email, and password are required." });
        }

        const existing = await db.getAsync(
            "SELECT * FROM users WHERE email = ?",
            [email],
        );
        if (existing) {
            return res
                .status(409)
                .json({ message: "Organizer with this email already exists." });
        }

        const hash = await bcrypt.hash(password, 10);
        const result = await db.runAsync(
            'INSERT INTO users (name, email, password_hash, role, website) VALUES (?, ?, ?, "organizer", ?)',
            [name, email, hash, website || ""],
        );

        const newUser = {
            id: result.lastID,
            name,
            email,
            role: "organizer",
            avatar: "",
            bio: "",
            website: website || "",
        };
        const tokens = generateTokens(newUser);

        res.status(201).json({
            message: "Organizer account created successfully",
            user: newUser,
            ...tokens,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post("/api/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res
                .status(400)
                .json({ message: "Email and password are required." });
        }

        const user = await db.getAsync("SELECT * FROM users WHERE email = ?", [
            email,
        ]);
        if (!user) {
            return res
                .status(401)
                .json({ message: "Invalid email or password." });
        }

        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) {
            return res
                .status(401)
                .json({ message: "Invalid email or password." });
        }

        const userData = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            bio: user.bio,
            website: user.website,
        };
        const tokens = generateTokens(userData);

        res.json({
            message: "Login successful",
            user: userData,
            ...tokens,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post("/api/auth/refresh-token", (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return res.status(401).json({ message: "Refresh token required." });
    }

    jwt.verify(refreshToken, JWT_REFRESH_SECRET, (err, decoded) => {
        if (err) {
            return res
                .status(403)
                .json({ message: "Invalid or expired refresh token." });
        }

        const payload = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role,
            name: decoded.name,
        };
        const newAccessToken = jwt.sign(payload, JWT_SECRET, {
            expiresIn: "1h",
        });

        res.json({ accessToken: newAccessToken });
    });
});

app.get("/api/auth/me", authenticateToken, async (req, res) => {
    try {
        const user = await db.getAsync(
            "SELECT id, name, email, role, avatar, bio, website, created_at FROM users WHERE id = ?",
            [req.user.id],
        );
        if (!user) return res.status(404).json({ message: "User not found." });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.patch("/api/auth/profile", authenticateToken, async (req, res) => {
    try {
        const { name, avatar, bio, website } = req.body;
        await db.runAsync(
            "UPDATE users SET name = COALESCE(?, name), avatar = COALESCE(?, avatar), bio = COALESCE(?, bio), website = COALESCE(?, website) WHERE id = ?",
            [name, avatar, bio, website, req.user.id],
        );
        const updated = await db.getAsync(
            "SELECT id, name, email, role, avatar, bio, website FROM users WHERE id = ?",
            [req.user.id],
        );
        res.json({ message: "Profile updated successfully", user: updated });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.patch("/api/auth/change-password", authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res
                .status(400)
                .json({
                    message: "Both current and new password are required.",
                });
        }

        const user = await db.getAsync(
            "SELECT password_hash FROM users WHERE id = ?",
            [req.user.id],
        );
        const match = await bcrypt.compare(currentPassword, user.password_hash);
        if (!match) {
            return res
                .status(400)
                .json({ message: "Current password does not match." });
        }

        const newHash = await bcrypt.hash(newPassword, 10);
        await db.runAsync("UPDATE users SET password_hash = ? WHERE id = ?", [
            newHash,
            req.user.id,
        ]);

        res.json({ message: "Password updated successfully." });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// -------------------------------------------------------------
// IMAGE UPLOAD ROUTES (Profiles, Speakers, Events)
// -------------------------------------------------------------

// Profile picture upload endpoint (Stores in public/uploads/profiles/ & saves to DB)
app.post(
    "/api/upload/profile",
    optionalAuth,
    createAnyUploadMiddleware(uploadProfile),
    async (req, res) => {
        if (!req.file) {
            return res
                .status(400)
                .json({
                    success: false,
                    message: "No profile image file uploaded.",
                });
        }
        try {
            const relativeUrl = `/uploads/profiles/${req.file.filename}`;
            const host = req.get("host") || `localhost:${PORT}`;
            const fullUrl = `${req.protocol}://${host}${relativeUrl}`;

            // Automatically update avatar in database for the user
            const targetUserId =
                (req.user && req.user.id) ||
                req.body.userId ||
                req.body.user_id ||
                1;
            if (targetUserId) {
                await db.runAsync("UPDATE users SET avatar = ? WHERE id = ?", [
                    relativeUrl,
                    targetUserId,
                ]);
            }

            const user = await db.getAsync(
                "SELECT id, name, email, role, avatar, bio, website FROM users WHERE id = ?",
                [targetUserId],
            );

            res.status(200).json({
                success: true,
                message:
                    "Profile picture uploaded to public/uploads/profiles/ and saved to database successfully",
                url: relativeUrl,
                fullUrl,
                filename: req.file.filename,
                category: "profiles",
                size: req.file.size,
                user,
            });
        } catch (dbErr) {
            res.status(500).json({ success: false, message: dbErr.message });
        }
    },
);

// Speaker photo upload endpoint (Stores in public/uploads/speakers/ & saves to DB)
app.post(
    "/api/upload/speaker",
    optionalAuth,
    createAnyUploadMiddleware(uploadSpeaker),
    async (req, res) => {
        if (!req.file) {
            return res
                .status(400)
                .json({
                    success: false,
                    message: "No speaker photo uploaded.",
                });
        }
        try {
            const relativeUrl = `/uploads/speakers/${req.file.filename}`;
            const host = req.get("host") || `localhost:${PORT}`;
            const fullUrl = `${req.protocol}://${host}${relativeUrl}`;

            const speakerId =
                req.body.speaker_id || req.body.speakerId || req.body.id;
            if (speakerId) {
                await db.runAsync(
                    "UPDATE speakers SET photo_url = ? WHERE id = ?",
                    [relativeUrl, speakerId],
                );
            }

            res.status(200).json({
                success: true,
                message:
                    "Speaker photo uploaded to public/uploads/speakers/ and saved to database successfully",
                url: relativeUrl,
                fullUrl,
                filename: req.file.filename,
                category: "speakers",
                size: req.file.size,
            });
        } catch (dbErr) {
            res.status(500).json({ success: false, message: dbErr.message });
        }
    },
);

// Event image/banner upload endpoint (Stores in public/uploads/events/ & saves to DB)
app.post(
    "/api/upload/event",
    optionalAuth,
    createAnyUploadMiddleware(uploadEvent),
    async (req, res) => {
        if (!req.file) {
            return res
                .status(400)
                .json({ success: false, message: "No event image uploaded." });
        }
        try {
            const relativeUrl = `/uploads/events/${req.file.filename}`;
            const host = req.get("host") || `localhost:${PORT}`;
            const fullUrl = `${req.protocol}://${host}${relativeUrl}`;

            const eventId =
                req.body.event_id || req.body.eventId || req.body.id;
            if (eventId) {
                await db.runAsync(
                    "UPDATE events SET banner_url = ? WHERE id = ?",
                    [relativeUrl, eventId],
                );
            }

            res.status(200).json({
                success: true,
                message:
                    "Event image uploaded to public/uploads/events/ and saved to database successfully",
                url: relativeUrl,
                fullUrl,
                filename: req.file.filename,
                category: "events",
                size: req.file.size,
            });
        } catch (dbErr) {
            res.status(500).json({ success: false, message: dbErr.message });
        }
    },
);

// Generic dynamic upload endpoint: /api/upload/:category
app.post("/api/upload/:category", optionalAuth, (req, res) => {
    let cat = (req.params.category || "profiles").toLowerCase();
    if (["profile", "profiles", "avatar", "user"].includes(cat))
        cat = "profiles";
    else if (["speaker", "speakers"].includes(cat)) cat = "speakers";
    else if (["event", "events", "banner"].includes(cat)) cat = "events";
    else cat = "profiles";

    const uploader =
        cat === "speakers"
            ? uploadSpeaker
            : cat === "events"
              ? uploadEvent
              : uploadProfile;
    createAnyUploadMiddleware(uploader)(req, res, async (err) => {
        if (err)
            return res
                .status(400)
                .json({ success: false, message: err.message });
        if (!req.file)
            return res
                .status(400)
                .json({ success: false, message: "No file uploaded." });
        try {
            const relativeUrl = `/uploads/${cat}/${req.file.filename}`;
            const host = req.get("host") || `localhost:${PORT}`;
            const fullUrl = `${req.protocol}://${host}${relativeUrl}`;

            if (cat === "profiles") {
                const targetUserId =
                    (req.user && req.user.id) ||
                    req.body.userId ||
                    req.body.user_id ||
                    1;
                await db.runAsync("UPDATE users SET avatar = ? WHERE id = ?", [
                    relativeUrl,
                    targetUserId,
                ]);
            } else if (
                cat === "speakers" &&
                (req.body.speaker_id || req.body.id)
            ) {
                await db.runAsync(
                    "UPDATE speakers SET photo_url = ? WHERE id = ?",
                    [relativeUrl, req.body.speaker_id || req.body.id],
                );
            } else if (cat === "events" && (req.body.event_id || req.body.id)) {
                await db.runAsync(
                    "UPDATE events SET banner_url = ? WHERE id = ?",
                    [relativeUrl, req.body.event_id || req.body.id],
                );
            }

            res.status(200).json({
                success: true,
                message: `${cat} image uploaded successfully`,
                url: relativeUrl,
                fullUrl,
                filename: req.file.filename,
                category: cat,
                size: req.file.size,
            });
        } catch (dbErr) {
            res.status(500).json({ success: false, message: dbErr.message });
        }
    });
});

// Profile data sync endpoints for frontend
app.get("/api/users/current", optionalAuth, async (req, res) => {
    try {
        const userId = (req.user && req.user.id) || req.query.userId || 1;
        const user = await db.getAsync(
            "SELECT id, name, email, role, avatar, bio, website FROM users WHERE id = ?",
            [userId],
        );
        if (!user)
            return res
                .status(404)
                .json({ success: false, message: "User not found" });
        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.post("/api/users/profile", optionalAuth, async (req, res) => {
    try {
        const userId = (req.user && req.user.id) || req.body.userId || 1;
        const { name, email, avatar, bio, website } = req.body;

        await db.runAsync(
            `
            UPDATE users
            SET name = COALESCE(?, name),
                email = COALESCE(?, email),
                avatar = COALESCE(?, avatar),
                bio = COALESCE(?, bio),
                website = COALESCE(?, website)
            WHERE id = ?
        `,
            [name, email, avatar, bio, website, userId],
        );

        const updated = await db.getAsync(
            "SELECT id, name, email, role, avatar, bio, website FROM users WHERE id = ?",
            [userId],
        );
        res.json({
            success: true,
            message: "Profile updated in database successfully",
            user: updated,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// -------------------------------------------------------------
// SPEAKERS API ROUTES
// -------------------------------------------------------------
app.get("/api/speakers", async (req, res) => {
    try {
        const { event_id } = req.query;
        let query = "SELECT * FROM speakers";
        const params = [];
        if (event_id) {
            query += " WHERE event_id = ?";
            params.push(event_id);
        }
        query += " ORDER BY id ASC";
        const speakers = await db.allAsync(query, params);
        res.json({ success: true, count: speakers.length, speakers });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.post("/api/speakers", optionalAuth, async (req, res) => {
    try {
        const { name, title, company, bio, photo_url, event_id } = req.body;
        if (!name || !title) {
            return res
                .status(400)
                .json({
                    success: false,
                    message: "Speaker name and title are required.",
                });
        }
        const result = await db.runAsync(
            "INSERT INTO speakers (name, title, company, bio, photo_url, event_id) VALUES (?, ?, ?, ?, ?, ?)",
            [
                name,
                title,
                company || "",
                bio || "",
                photo_url || "",
                event_id || 1,
            ],
        );
        const newSpeaker = await db.getAsync(
            "SELECT * FROM speakers WHERE id = ?",
            [result.lastID],
        );
        res.status(201).json({
            success: true,
            message: "Speaker created successfully",
            speaker: newSpeaker,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// -------------------------------------------------------------
// EVENT ROUTES
// -------------------------------------------------------------
app.get("/api/events", optionalAuth, async (req, res) => {
    try {
        const { search, category, venue, sort, status, page, limit } =
            req.query;
        let whereClause = " WHERE 1=1";
        const params = [];

        // Public users only see published events by default
        if (status) {
            whereClause += " AND e.status = ?";
            params.push(status);
        } else {
            whereClause += ' AND e.status = "published"';
        }

        if (search) {
            whereClause +=
                " AND (e.title LIKE ? OR e.description LIKE ? OR e.venue LIKE ?)";
            const term = `%${search}%`;
            params.push(term, term, term);
        }

        if (category && category !== "All Events" && category !== "all") {
            whereClause += " AND LOWER(e.category) LIKE ?";
            params.push(`%${category.toLowerCase()}%`);
        }

        if (venue && venue !== "all" && venue !== "All Venues") {
            whereClause += " AND LOWER(e.venue) LIKE ?";
            params.push(`%${venue.toLowerCase()}%`);
        }

        let orderClause = " ORDER BY e.date_time ASC";
        if (sort === "popular") {
            orderClause = " ORDER BY seats_booked DESC";
        } else if (sort === "latest") {
            orderClause = " ORDER BY e.created_at DESC";
        }

        const isPaginated = page !== undefined;
        let pageInt = 1;
        let limitInt = 6;
        let totalCount = 0;

        if (isPaginated) {
            pageInt = Math.max(1, parseInt(page, 10) || 1);
            limitInt = Math.max(1, parseInt(limit, 10) || 6);

            const countSql = `
                SELECT COUNT(*) as total
                FROM events e
                JOIN users u ON e.organizer_id = u.id
                ${whereClause}
            `;
            const countRow = await db.getAsync(countSql, params);
            totalCount = countRow ? countRow.total : 0;
        }

        let query = `
            SELECT e.*, u.name as organizer_name, u.avatar as organizer_avatar,
                   (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.id) as seats_booked
            FROM events e
            JOIN users u ON e.organizer_id = u.id
            ${whereClause}
            ${orderClause}
        `;

        const queryParams = [...params];
        if (isPaginated) {
            const offset = (pageInt - 1) * limitInt;
            query += " LIMIT ? OFFSET ?";
            queryParams.push(limitInt, offset);
        }

        const events = await db.allAsync(query, queryParams);

        let bookmarkedSet = new Set();
        if (req.user) {
            const userBookmarks = await db.allAsync(
                "SELECT event_id FROM bookmarks WHERE user_id = ?",
                [req.user.id],
            );
            bookmarkedSet = new Set(userBookmarks.map((b) => b.event_id));
        }

        events.forEach((e) => {
            const booked = e.seats_booked || 0;
            e.booked_seats = booked;
            e.capacity_percentage =
                e.total_seats > 0
                    ? Math.round((booked / e.total_seats) * 100)
                    : 0;
            e.is_bookmarked = bookmarkedSet.has(e.id);
            e.organizer = {
                id: e.organizer_id,
                name: e.organizer_name,
                avatar: e.organizer_avatar,
            };
        });

        if (isPaginated) {
            const totalPages = Math.ceil(totalCount / limitInt) || 1;
            res.json({
                events,
                pagination: {
                    total: totalCount,
                    page: pageInt,
                    limit: limitInt,
                    totalPages,
                    hasPrev: pageInt > 1,
                    hasNext: pageInt < totalPages,
                },
            });
        } else {
            res.json(events);
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.get("/api/events/:id", optionalAuth, async (req, res) => {
    try {
        const eventId = req.params.id;
        const event = await db.getAsync(
            `
            SELECT e.*, u.name as organizer_name, u.email as organizer_email, u.avatar as organizer_avatar, u.bio as organizer_bio, u.website as organizer_website,
                   (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.id) as seats_booked
            FROM events e
            JOIN users u ON e.organizer_id = u.id
            WHERE e.id = ?
        `,
            [eventId],
        );

        if (!event)
            return res.status(404).json({ message: "Event not found." });

        // Structured organizer object and capacity metrics
        const booked = event.seats_booked || 0;
        event.booked_seats = booked;
        event.capacity_percentage =
            event.total_seats > 0
                ? Math.round((booked / event.total_seats) * 100)
                : 0;
        event.organizer = {
            id: event.organizer_id,
            name: event.organizer_name,
            email: event.organizer_email,
            avatar: event.organizer_avatar,
            bio: event.organizer_bio,
            website: event.organizer_website,
        };

        // Comments
        const comments = await db.allAsync(
            `
            SELECT c.id, c.content, c.created_at, c.user_id, u.name as user_name, u.avatar as user_avatar
            FROM comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.event_id = ?
            ORDER BY c.created_at DESC
        `,
            [eventId],
        );

        event.comments = comments;
        event.is_registered = false;
        event.is_bookmarked = false;
        event.registration = null;

        if (req.user) {
            const reg = await db.getAsync(
                `
                SELECT id, notes, card_holder_name, card_last4, card_brand, billing_postal_code,
                       payment_status, amount_paid, payment_method, created_at
                FROM registrations
                WHERE event_id = ? AND user_id = ?
            `,
                [eventId, req.user.id],
            );
            event.is_registered = !!reg;
            event.registration = reg || null;

            const bm = await db.getAsync(
                "SELECT id FROM bookmarks WHERE event_id = ? AND user_id = ?",
                [eventId, req.user.id],
            );
            event.is_bookmarked = !!bm;
        }

        const eventSpeakers = await db.allAsync(
            "SELECT * FROM speakers WHERE event_id = ? ORDER BY id ASC",
            [eventId],
        );
        event.speakers = eventSpeakers;

        res.json(event);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// -------------------------------------------------------------
// PUBLIC ORGANIZER PROFILE ROUTE (Requirement: clicking organizer name leads to public profile)
// -------------------------------------------------------------
const getOrganizerProfile = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await db.getAsync(
            "SELECT id, name, email, role, avatar, bio, website, created_at FROM users WHERE id = ?",
            [userId],
        );
        if (!user) {
            return res.status(404).json({ message: "Organizer not found." });
        }

        const events = await db.allAsync(
            `
            SELECT e.*, (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.id) as seats_booked
            FROM events e
            WHERE e.organizer_id = ? AND e.status = 'published'
            ORDER BY e.date_time ASC
        `,
            [user.id],
        );

        events.forEach((e) => {
            const booked = e.seats_booked || 0;
            e.booked_seats = booked;
            e.capacity_percentage =
                e.total_seats > 0
                    ? Math.round((booked / e.total_seats) * 100)
                    : 0;
        });

        user.events = events;
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

app.get("/api/organizers/:id", getOrganizerProfile);
app.get("/api/users/:id", getOrganizerProfile);

app.post(
    "/api/events",
    authenticateToken,
    requireRole("organizer"),
    async (req, res) => {
        try {
            const organizerId = req.user.id;
            const {
                title,
                description,
                category,
                date_time,
                venue,
                total_seats,
                price,
                banner_url,
                status,
                speakers,
            } = req.body;
            if (!title || !description || !category || !date_time || !venue) {
                return res
                    .status(400)
                    .json({
                        message:
                            "Title, description, category, date_time, and venue are required.",
                    });
            }

            const parsedPrice =
                price !== undefined && price !== null && price !== ""
                    ? parseFloat(price)
                    : 49.0;

            const result = await db.runAsync(
                `
            INSERT INTO events (title, description, category, date_time, venue, total_seats, price, banner_url, status, organizer_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
                [
                    title,
                    description,
                    category,
                    date_time,
                    venue,
                    total_seats || 50,
                    isNaN(parsedPrice) ? 49.0 : parsedPrice,
                    banner_url || "",
                    status || "published",
                    organizerId,
                ],
            );

            const eventId = result.lastID;

            // Save multiple keynote speakers if provided
            if (Array.isArray(speakers) && speakers.length > 0) {
                for (const spk of speakers) {
                    if (spk && spk.name && spk.name.trim()) {
                        await db.runAsync(
                            `
                        INSERT INTO speakers (name, title, company, bio, photo_url, event_id)
                        VALUES (?, ?, ?, ?, ?, ?)
                    `,
                            [
                                spk.name.trim(),
                                spk.title
                                    ? spk.title.trim()
                                    : spk.role
                                      ? spk.role.trim()
                                      : "Keynote Speaker",
                                spk.company ? spk.company.trim() : "",
                                spk.bio ? spk.bio.trim() : "",
                                spk.photo_url || spk.photo || "",
                                eventId,
                            ],
                        );
                    }
                }
            }

            const newEvent = await db.getAsync(
                "SELECT * FROM events WHERE id = ?",
                [eventId],
            );
            const eventSpeakers = await db.allAsync(
                "SELECT * FROM speakers WHERE event_id = ? ORDER BY id ASC",
                [eventId],
            );
            newEvent.speakers = eventSpeakers;

            res.status(201).json({
                message: "Event created successfully",
                event: newEvent,
                eventId,
            });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },
);

app.patch(
    "/api/events/:id",
    authenticateToken,
    requireRole("organizer"),
    async (req, res) => {
        try {
            const eventId = req.params.id;
            const event = await db.getAsync(
                "SELECT * FROM events WHERE id = ?",
                [eventId],
            );
            if (!event)
                return res.status(404).json({ message: "Event not found." });

            if (event.organizer_id !== req.user.id) {
                return res
                    .status(403)
                    .json({
                        message: "You can only edit events created by you.",
                    });
            }

            const {
                title,
                description,
                category,
                date_time,
                venue,
                total_seats,
                price,
                banner_url,
                status,
            } = req.body;
            const parsedPrice =
                price !== undefined && price !== null && price !== ""
                    ? parseFloat(price)
                    : null;

            await db.runAsync(
                `
            UPDATE events
            SET title = COALESCE(?, title),
                description = COALESCE(?, description),
                category = COALESCE(?, category),
                date_time = COALESCE(?, date_time),
                venue = COALESCE(?, venue),
                total_seats = COALESCE(?, total_seats),
                price = COALESCE(?, price),
                banner_url = COALESCE(?, banner_url),
                status = COALESCE(?, status)
            WHERE id = ?
        `,
                [
                    title,
                    description,
                    category,
                    date_time,
                    venue,
                    total_seats,
                    parsedPrice,
                    banner_url,
                    status,
                    eventId,
                ],
            );

            const updated = await db.getAsync(
                "SELECT * FROM events WHERE id = ?",
                [eventId],
            );
            res.json({ message: "Event updated successfully", event: updated });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },
);

app.patch(
    "/api/events/:id/status",
    authenticateToken,
    requireRole("organizer"),
    async (req, res) => {
        try {
            const eventId = req.params.id;
            const { status } = req.body;
            if (!["draft", "published"].includes(status)) {
                return res
                    .status(400)
                    .json({
                        message: 'Status must be "draft" or "published".',
                    });
            }

            const event = await db.getAsync(
                "SELECT * FROM events WHERE id = ?",
                [eventId],
            );
            if (!event)
                return res.status(404).json({ message: "Event not found." });
            if (event.organizer_id !== req.user.id) {
                return res.status(403).json({ message: "Unauthorized." });
            }

            await db.runAsync("UPDATE events SET status = ? WHERE id = ?", [
                status,
                eventId,
            ]);
            res.json({ message: `Status updated to ${status}` });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },
);

app.delete(
    "/api/events/:id",
    authenticateToken,
    requireRole("organizer"),
    async (req, res) => {
        try {
            const eventId = req.params.id;
            const event = await db.getAsync(
                "SELECT * FROM events WHERE id = ?",
                [eventId],
            );
            if (!event)
                return res.status(404).json({ message: "Event not found." });

            if (event.organizer_id !== req.user.id) {
                return res
                    .status(403)
                    .json({
                        message: "You can only delete events created by you.",
                    });
            }

            await db.runAsync("DELETE FROM events WHERE id = ?", [eventId]);
            res.json({ message: "Event deleted successfully." });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },
);

// -------------------------------------------------------------
// REGISTRATION (RSVP) ROUTES
// -------------------------------------------------------------
app.post("/api/events/:id/register", authenticateToken, async (req, res) => {
    try {
        const eventId = req.params.id;
        const {
            notes,
            card_holder_name,
            cardHolderName,
            card_number,
            cardNumber,
            exp_date,
            expDate,
            expiry,
            cvc,
            billing_postal_code,
            postal_code,
            postalCode,
            zip,
            amount_paid,
            amount,
        } = req.body;

        const event = await db.getAsync(
            `
            SELECT e.*, (SELECT COUNT(*) FROM registrations WHERE event_id = e.id) as booked
            FROM events e WHERE e.id = ?
        `,
            [eventId],
        );

        if (!event)
            return res.status(404).json({ message: "Event not found." });
        if (event.booked >= event.total_seats) {
            return res
                .status(400)
                .json({
                    message: "Sorry, this event is already fully booked.",
                });
        }

        const already = await db.getAsync(
            "SELECT id FROM registrations WHERE event_id = ? AND user_id = ?",
            [eventId, req.user.id],
        );
        if (already) {
            return res
                .status(400)
                .json({
                    message: "You are already registered for this event.",
                });
        }

        const holderName = (
            card_holder_name ||
            cardHolderName ||
            req.user.name ||
            ""
        ).trim();
        const rawCard = (card_number || cardNumber || "").replace(/\s+|-/g, "");
        const rawExp = (exp_date || expDate || expiry || "").trim();
        const rawCvc = (cvc || "").trim();
        const postal = (
            billing_postal_code ||
            postal_code ||
            postalCode ||
            zip ||
            ""
        ).trim();
        const fee =
            typeof amount_paid === "number"
                ? amount_paid
                : typeof amount === "number"
                  ? amount
                  : 49.0;

        // Card validation if card info is provided
        if (rawCard) {
            if (!/^\d{12,19}$/.test(rawCard)) {
                return res
                    .status(400)
                    .json({
                        message:
                            "Invalid card number format. Please provide a valid 13-19 digit card number.",
                    });
            }
            if (rawExp) {
                const expMatch = rawExp.match(
                    /^(\d{1,2})\s*\/?\s*(\d{2}|\d{4})$/,
                );
                if (!expMatch) {
                    return res
                        .status(400)
                        .json({
                            message:
                                "Invalid expiration date format. Use MM/YY.",
                        });
                }
                const expMonth = parseInt(expMatch[1], 10);
                if (expMonth < 1 || expMonth > 12) {
                    return res
                        .status(400)
                        .json({
                            message:
                                "Invalid expiration month. Must be between 01 and 12.",
                        });
                }
            }
            if (rawCvc && !/^\d{3,4}$/.test(rawCvc)) {
                return res
                    .status(400)
                    .json({
                        message:
                            "Invalid CVC / CVV code. Must be 3 or 4 digits.",
                    });
            }
        }

        // Determine card brand and last 4
        let cardBrand = "card";
        if (/^4/.test(rawCard)) cardBrand = "visa";
        else if (/^(5[1-5]|2[2-7])/.test(rawCard)) cardBrand = "mastercard";
        else if (/^3[47]/.test(rawCard)) cardBrand = "amex";
        else if (/^6(011|5)/.test(rawCard)) cardBrand = "discover";
        else if (!rawCard) cardBrand = "visa";

        const cardLast4 = rawCard ? rawCard.slice(-4) : "4242";
        const finalHolder = holderName || req.user.name || "Cardholder";

        const insertResult = await db.runAsync(
            `
            INSERT INTO registrations (
                event_id, user_id, notes,
                card_holder_name, card_last4, card_brand, billing_postal_code,
                payment_status, amount_paid, payment_method
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
            [
                eventId,
                req.user.id,
                notes || "",
                finalHolder,
                cardLast4,
                cardBrand,
                postal || "1209",
                "paid",
                fee,
                "card",
            ],
        );

        res.status(201).json({
            message: "Payment processed and seat booking confirmed!",
            registration: {
                id: insertResult.lastID,
                event_id: Number(eventId),
                user_id: req.user.id,
                notes: notes || "",
                card_holder_name: finalHolder,
                card_last4: cardLast4,
                card_brand: cardBrand,
                billing_postal_code: postal || "1209",
                payment_status: "paid",
                amount_paid: fee,
                payment_method: "card",
                created_at: new Date().toISOString(),
            },
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.delete("/api/events/:id/register", authenticateToken, async (req, res) => {
    try {
        const eventId = req.params.id;
        const reg = await db.getAsync(
            "SELECT id FROM registrations WHERE event_id = ? AND user_id = ?",
            [eventId, req.user.id],
        );
        if (!reg) {
            return res
                .status(404)
                .json({
                    message: "No active registration found for this event.",
                });
        }

        await db.runAsync("DELETE FROM registrations WHERE id = ?", [reg.id]);
        res.json({ message: "Registration withdrawn successfully." });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.get("/api/user/registrations", authenticateToken, async (req, res) => {
    try {
        const registrations = await db.allAsync(
            `
            SELECT r.id as registration_id, r.notes, r.created_at as registered_at,
                   r.card_holder_name, r.card_last4, r.card_brand, r.billing_postal_code,
                   r.payment_status, r.amount_paid, r.payment_method,
                   e.id as event_id, e.title, e.category, e.date_time, e.venue, e.banner_url, e.status,
                   u.name as organizer_name
            FROM registrations r
            JOIN events e ON r.event_id = e.id
            JOIN users u ON e.organizer_id = u.id
            WHERE r.user_id = ?
            ORDER BY r.created_at DESC
        `,
            [req.user.id],
        );

        res.json(registrations);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.get(
    "/api/events/:id/attendees",
    authenticateToken,
    requireRole("organizer"),
    async (req, res) => {
        try {
            const eventId = req.params.id;
            const event = await db.getAsync(
                "SELECT organizer_id FROM events WHERE id = ?",
                [eventId],
            );
            if (!event)
                return res.status(404).json({ message: "Event not found." });
            if (event.organizer_id !== req.user.id) {
                return res.status(403).json({ message: "Unauthorized." });
            }

            const attendees = await db.allAsync(
                `
            SELECT r.id as registration_id, r.notes, r.created_at as registered_at,
                   r.card_holder_name, r.card_last4, r.card_brand, r.billing_postal_code,
                   r.payment_status, r.amount_paid, r.payment_method,
                   u.id as user_id, u.name, u.name as user_name, u.email, u.avatar
            FROM registrations r
            JOIN users u ON r.user_id = u.id
            WHERE r.event_id = ?
            ORDER BY r.created_at DESC
        `,
                [eventId],
            );

            res.json(attendees);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },
);

// -------------------------------------------------------------
// BOOKMARK ROUTES
// -------------------------------------------------------------
// Toggle bookmark on/off
app.post("/api/events/:id/bookmark", authenticateToken, async (req, res) => {
    try {
        const eventId = req.params.id;
        const existing = await db.getAsync(
            "SELECT id FROM bookmarks WHERE event_id = ? AND user_id = ?",
            [eventId, req.user.id],
        );
        if (existing) {
            await db.runAsync("DELETE FROM bookmarks WHERE id = ?", [
                existing.id,
            ]);
            return res.json({
                message: "Removed from bookmarks",
                is_bookmarked: false,
            });
        } else {
            await db.runAsync(
                "INSERT INTO bookmarks (event_id, user_id) VALUES (?, ?)",
                [eventId, req.user.id],
            );
            return res.json({
                message: "Added to bookmarks",
                is_bookmarked: true,
            });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Explicit delete/remove bookmark
app.delete("/api/events/:id/bookmark", authenticateToken, async (req, res) => {
    try {
        const eventId = req.params.id;
        const result = await db.runAsync(
            "DELETE FROM bookmarks WHERE event_id = ? AND user_id = ?",
            [eventId, req.user.id],
        );
        return res.json({
            message: "Removed from bookmarks",
            is_bookmarked: false,
            deletedCount: result.changes,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Check if specific event is bookmarked by user
app.get("/api/events/:id/bookmark", authenticateToken, async (req, res) => {
    try {
        const eventId = req.params.id;
        const existing = await db.getAsync(
            "SELECT id FROM bookmarks WHERE event_id = ? AND user_id = ?",
            [eventId, req.user.id],
        );
        return res.json({
            event_id: Number(eventId),
            is_bookmarked: !!existing,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// List all user bookmarks
app.get("/api/user/bookmarks", authenticateToken, async (req, res) => {
    try {
        const bookmarks = await db.allAsync(
            `
            SELECT b.id as bookmark_id, b.created_at as bookmarked_at,
                   e.id, e.title, e.category, e.date_time, e.venue, e.total_seats, e.banner_url,
                   (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.id) as seats_booked,
                   u.name as organizer_name
            FROM bookmarks b
            JOIN events e ON b.event_id = e.id
            JOIN users u ON e.organizer_id = u.id
            WHERE b.user_id = ?
            ORDER BY b.created_at DESC
        `,
            [req.user.id],
        );

        res.json(bookmarks);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Aliases for user bookmarks: GET /api/bookmarks, POST /api/bookmarks/:eventId, DELETE /api/bookmarks/:id
app.get("/api/bookmarks", authenticateToken, async (req, res) => {
    try {
        const bookmarks = await db.allAsync(
            `
            SELECT b.id as bookmark_id, b.created_at as bookmarked_at,
                   e.id, e.title, e.category, e.date_time, e.venue, e.total_seats, e.banner_url,
                   (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.id) as seats_booked,
                   u.name as organizer_name
            FROM bookmarks b
            JOIN events e ON b.event_id = e.id
            JOIN users u ON e.organizer_id = u.id
            WHERE b.user_id = ?
            ORDER BY b.created_at DESC
        `,
            [req.user.id],
        );

        res.json(bookmarks);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post("/api/bookmarks/:id", authenticateToken, async (req, res) => {
    try {
        const eventId = req.params.id;
        const existing = await db.getAsync(
            "SELECT id FROM bookmarks WHERE event_id = ? AND user_id = ?",
            [eventId, req.user.id],
        );
        if (existing) {
            await db.runAsync("DELETE FROM bookmarks WHERE id = ?", [
                existing.id,
            ]);
            return res.json({
                message: "Removed from bookmarks",
                is_bookmarked: false,
            });
        } else {
            await db.runAsync(
                "INSERT INTO bookmarks (event_id, user_id) VALUES (?, ?)",
                [eventId, req.user.id],
            );
            return res.json({
                message: "Added to bookmarks",
                is_bookmarked: true,
            });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.delete("/api/bookmarks/:id", authenticateToken, async (req, res) => {
    try {
        const id = req.params.id;
        // Can be bookmark id or event id
        await db.runAsync(
            "DELETE FROM bookmarks WHERE (id = ? OR event_id = ?) AND user_id = ?",
            [id, id, req.user.id],
        );
        return res.json({
            message: "Removed from bookmarks",
            is_bookmarked: false,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// -------------------------------------------------------------
// COMMENT ROUTES
// -------------------------------------------------------------
app.post("/api/events/:id/comments", authenticateToken, async (req, res) => {
    try {
        const eventId = req.params.id;
        const { content } = req.body;
        if (!content || !content.trim()) {
            return res
                .status(400)
                .json({ message: "Comment content cannot be empty." });
        }

        const result = await db.runAsync(
            "INSERT INTO comments (event_id, user_id, content) VALUES (?, ?, ?)",
            [eventId, req.user.id, content.trim()],
        );

        const newComment = await db.getAsync(
            `
            SELECT c.id, c.content, c.created_at, c.user_id, u.name as user_name, u.avatar as user_avatar
            FROM comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.id = ?
        `,
            [result.lastID],
        );

        res.status(201).json({ message: "Comment added", comment: newComment });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.delete("/api/comments/:id", authenticateToken, async (req, res) => {
    try {
        const commentId = req.params.id;
        const comment = await db.getAsync(
            "SELECT * FROM comments WHERE id = ?",
            [commentId],
        );
        if (!comment)
            return res.status(404).json({ message: "Comment not found." });

        if (comment.user_id !== req.user.id) {
            return res
                .status(403)
                .json({ message: "You can only delete your own comments." });
        }

        await db.runAsync("DELETE FROM comments WHERE id = ?", [commentId]);
        res.json({ message: "Comment deleted successfully." });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// -------------------------------------------------------------
// ORGANIZER DASHBOARD STATS
// -------------------------------------------------------------
app.get(
    "/api/organizer/dashboard",
    authenticateToken,
    requireRole("organizer"),
    async (req, res) => {
        try {
            const organizerId = req.user.id;

            const totalEventsRow = await db.getAsync(
                "SELECT COUNT(*) as count FROM events WHERE organizer_id = ?",
                [organizerId],
            );
            const activeEventsRow = await db.getAsync(
                'SELECT COUNT(*) as count FROM events WHERE organizer_id = ? AND status = "published"',
                [organizerId],
            );
            const draftEventsRow = await db.getAsync(
                'SELECT COUNT(*) as count FROM events WHERE organizer_id = ? AND status = "draft"',
                [organizerId],
            );

            const totalRsvpsRow = await db.getAsync(
                `
            SELECT COUNT(*) as count
            FROM registrations r
            JOIN events e ON r.event_id = e.id
            WHERE e.organizer_id = ?
        `,
                [organizerId],
            );

            const myEvents = await db.allAsync(
                `
            SELECT e.*, (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.id) as seats_booked
            FROM events e
            WHERE e.organizer_id = ?
            ORDER BY e.created_at DESC
        `,
                [organizerId],
            );

            res.json({
                stats: {
                    totalEvents: totalEventsRow.count,
                    activeEvents: activeEventsRow.count,
                    draftEvents: draftEventsRow.count,
                    totalAttendees: totalRsvpsRow.count,
                },
                events: myEvents,
            });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },
);

app.get("/api/health", (req, res) => {
    res.json({
        status: "ok",
        server: "Event LWS API",
        timestamp: new Date().toISOString(),
    });
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Event LWS API server running on http://localhost:${PORT}`);
    });
}

module.exports = app;
