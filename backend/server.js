const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();

app.use(cors({
    origin: "http://localhost:5173"
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
    const query = "SELECT id, first_name, last_name, photo FROM authors;";

    db.query(query, (err, results) => {
        if (err) {
            console.error("SQL error:", err);
            return res.status(500).json({ error: "Failed to fetch authors" });
        }
        res.json(results);
    });
});


app.listen(5000, () => console.log("Server running on port 5000"));