const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"]
}));

const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "root1",
    database: "bookstore",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

app.get("/categories", (req, res) => {
    const query = "SELECT id, name, view_name FROM categories ORDER BY name";

    db.query(query, (err, results) => {
        if (err) {
            console.error("SQL error:", err);
            return res.status(500).json({ error: "Failed to fetch categories" });
        }
        res.json(results);
    });
});

app.get("/genres", (req, res) => {
    const query = "select id, genre from genres";

    db.query(query, (err, results) => {
        if (err) {
            console.error("SQL error:", err);
            return res.status(500).json({ error: "Failed to fetch genres" });
        }
        res.json(results);
    });
});

app.get("/types", (req, res) => {
    const query = "select id, type from type";

    db.query(query, (err, results) => {
        if (err) {
            console.error("SQL error:", err);
            return res.status(500).json({ error: "Failed to fetch type" });
        }
        res.json(results);
    });
});

app.get("/price", (req, res) => {
    const query = "select max(bt.price) as max, min(bt.price) as min  from book_type bt";

    db.query(query, (err, results) => {
        if (err) {
            console.error("SQL error:", err);
            return res.status(500).json({ error: "Failed to fetch type" });
        }
        res.json(results);
    });
});

app.get("/langs", (req, res) => {
    const query = "select id, name from langs";

    db.query(query, (err, results) => {
        if (err) {
            console.error("SQL error:", err);
            return res.status(500).json({ error: "Failed to fetch languages" });
        }
        res.json(results);
    });
});

app.get("/books", (req, res) => {
    const categoryIdentifier = req.query.category;
    const limit = parseInt(req.query.limit) || 7;
    const offset = parseInt(req.query.offset) || 0;

    if (!categoryIdentifier) {
        return res.status(400).json({ error: "Category is required" });
    }

    const getCategoryQuery = `
        SELECT view_name, name 
        FROM categories 
        WHERE id = ? OR name = ? OR view_name = ?
    `;

    db.query(getCategoryQuery, [categoryIdentifier, categoryIdentifier, categoryIdentifier], (err, categoryResults) => {
        if (err) {
            console.error("SQL error:", err);
            return res.status(500).json({ error: "Database error" });
        }

        if (categoryResults.length === 0) {
            return res.status(404).json({ error: "Category not found" });
        }

        const viewName = categoryResults[0].view_name;

        const query = `SELECT * FROM ${mysql.escapeId(viewName)} ORDER BY price DESC LIMIT ? OFFSET ?`;

        db.query(query, [limit, offset], (err, results) => {
            if (err) {
                console.error("SQL error:", err);
                return;
            }
            res.json(results);
        });
    });
});

app.get("/authors", (req, res) => {
    const id = req.query.id;
    let query = "SELECT id, first_name, last_name, biography, photo FROM authors";
    const params = [];

    if (id) {
        query += " WHERE id = ?";
        params.push(id);
    }

    db.query(query, params, (err, results) => {
        if (err) {
            console.error("SQL error:", err);
            return res.status(500).json({ error: "Failed to fetch authors" });
        }
        res.json(results);
    });
});


app.get("/publishers", (req, res) => {

    const id = req.query.id;

    let query = "SELECT ID, name, photo FROM publishers";
    let params = [];

    if (id) {
        query += " WHERE ID = ?";
        params.push(id);
    }

    db.query(query, params, (err, results) => {
        if (err) {
            console.error("SQL error:", err);
            return res.status(500).json({ error: "Failed to fetch publishers" });
        }
        res.json(results);
    });

});

app.get("/authors_books", (req, res) => {
    const { bookId, authorId, limit = 20, offset = 0 } = req.query;

    let query = `
        SELECT DISTINCT
            bt.id AS book_type_id,
            b.id AS book_id,
            b.title,
            p.name AS publisher,
            bt.type_id,
            t.type,
            bt.price,
            b.annotation,
            bt.availability,
            b.cover,
            b.year,
            a.id AS author_id,
            a.first_name,
            a.last_name,
            a.biography,
            a.photo,
            l.name as lang
        FROM book_type bt
        JOIN books b ON b.id = bt.book_id
        JOIN authors a ON a.id = b.author
        JOIN publishers p ON p.id = b.publisher_id
        JOIN type t ON t.id = bt.type_id
        JOIN langs l ON l.id = b.lang_id
    `;

    const conditions = [];
    const params = [];

    if (bookId) {
        // Підзапит для book_id
        conditions.push("bt.book_id = (SELECT book_id FROM book_type WHERE id = ?)");
        params.push(bookId);
    }

    if (authorId) {
        conditions.push("a.id = ?");
        params.push(authorId);
    }
    if (conditions.length > 0) {
        query += " WHERE " + conditions.join(" AND ");
    }
    query += " ORDER BY bt.id LIMIT ? OFFSET ?";
    params.push(Number(limit), Number(offset));

    db.query(query, params, (err, results) => {
        if (err) {
            console.error("SQL error:", err);
            return res.status(500).json({ error: "Failed to fetch books" });
        }
        res.json(results);
    });
});

app.post("/log_in", (req, res) => {
    const { login, password } = req.body;

    db.query(
        `SELECT id, login, password, role FROM users WHERE login = ? LIMIT 1`,
        [login],
        async (err, results) => {
            if (err) return res.status(500).send("Server error");
            if (!results || results.length === 0) {
                return res.status(401).json({ error: "Невірний логін або пароль" });
            }
            const user = results[0];
            if (password != user.password) {
                return res.status(401).json({ error: "Невірний логін або пароль" });
            }
            res.json({ login: user.login, role: user.role });
        }
    );
});


app.post("/sign_up", async (req, res) => {
    console.log("Body received:", req.body);

    const { login, password, first_name, last_name, phone_number, role } = req.body || {};

    if (!login || !password) {
        console.log("Login or password missing");
        return res.status(400).send("Login or password missing");
    }

    const query = `INSERT INTO users(first_name, last_name, login, password, phone_number, role) VALUES(?, ?, ?, ?, ?, ?)`;

    db.query(query, [first_name, last_name, login, password, phone_number, role], (err, results) => {
        if (err) {
            console.error("SQL error:", err);
            return res.status(500).send("Server error");
        }
        res.json({ message: "User registered successfully", login });
    });
});


app.get("/filteredbooks", (req, res) => {

    const genres = req.query.genres
        ? req.query.genres.split(",").map(Number)
        : [];

    const types = req.query.types
        ? req.query.types.split(",").map(Number)
        : [];

    const langs = req.query.langs
        ? req.query.langs.split(",").map(Number)
        : [];

    const minPrice = req.query.minPrice
        ? Number(req.query.minPrice)
        : null;

    const maxPrice = req.query.maxPrice
        ? Number(req.query.maxPrice)
        : null;

    let sql = `
        SELECT DISTINCT
            bt.ID AS ID,
            b.ID AS book_id,
            b.title AS title,
            b.year AS year,
            a.first_name AS first_name,
            a.last_name AS last_name,
            bt.price AS price,
            b.cover AS cover,
            t.type AS type,
            bt.availability,
            l.name AS lang
        FROM book_type bt
        JOIN books b ON b.ID = bt.book_id
        JOIN authors a ON a.ID = b.author
        JOIN book_genre bg ON bg.book_id = b.ID
        JOIN type t ON t.ID = bt.type_id
        JOIN langs l ON l.id = b.lang_id
        WHERE 1=1
    `;

    const values = [];

    if (genres.length) {
        sql += ` AND bg.genre_id IN (${genres.map(() => "?").join(",")})`;
        values.push(...genres);
    }

    if (types.length) {
        sql += ` AND bt.type_id IN (${types.map(() => "?").join(",")})`;
        values.push(...types);
    }

    if (langs.length) {
        sql += ` AND b.lang_id IN (${langs.map(() => "?").join(",")})`;
        values.push(...langs);
    }

    if (minPrice !== null) {
        sql += ` AND bt.price >= ?`;
        values.push(minPrice);
    }

    if (maxPrice !== null) {
        sql += ` AND bt.price <= ?`;
        values.push(maxPrice);
    }

    db.query(sql, values, (err, results) => {
        if (err) {
            console.error("SQL error:", err);
            return res.status(500).json({ error: "Failed to fetch books" });
        }
        res.json(results);
    });
});

app.listen(5000, () => console.log("Server running on port 5000"));