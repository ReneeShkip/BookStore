const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
    origin: "http://localhost:5176"
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
            p.name as publisher,
            bt.type_id,
            bt.price,
            b.annotation,
            bt.availability, 
            b.cover, 
            b.year, 
            a.id AS author_id,
            a.first_name, 
            a.last_name, 
            a.biography, 
            a.photo
        FROM book_type bt
        JOIN books b ON b.id = bt.book_id
        JOIN authors a ON a.id = b.author
        JOIN publishers p ON p.id = b.publisher_id
    `;

    const conditions = [];
    const params = [];

    if (bookId) {
        conditions.push("b.id = ?");
        params.push(bookId);
    }

    if (authorId) {
        conditions.push("a.id = ?");
        params.push(authorId);
        conditions.push("bt.type_id = 1");
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

app.post("/log_in", async (req, res) => {
    console.log("Body received:", req.body);

    const { login, password } = req.body || {};
    if (!login || !password) {
        console.log("Login or password missing");
        return res.status(400).send("Login or password missing");
    }

    const query = `SELECT id, login, password, role FROM users WHERE login = ? LIMIT 1`;

    db.query(query, [login], async (err, results) => {
        if (err) {
            console.error("SQL error:", err);
            return res.status(500).send("Server error");
        }

        console.log("DB results:", results);

        if (!results || results.length === 0) {
            return res.status(401).send("Невірний логін або пароль");
        }

        const user = results[0];

        try {
            if (password !== user.password) {
                return res.status(401).send("Невірний логін або пароль");
            }
            res.json({ login: user.login, role: user.role });
        } catch (err) {
            console.error("Error in bcrypt:", err);
            res.status(500).send("Server error");
        }
    });
});

app.post("/sign_up", async (req, res) => {
    console.log("Body received:", req.body);

    // ВИПРАВЛЕНО: витягуємо ВСІ потрібні поля
    const { login, password, first_name, last_name, phone_number, role } = req.body || {};

    // Перевіряємо обов'язкові поля
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

app.listen(5000, () => console.log("Server running on port 5000"));