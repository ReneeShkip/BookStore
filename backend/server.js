const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();

app.use(cors({
    origin: "http://localhost:5173"
}));

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root1",
    database: "bookstore"
});

db.connect(err => {
    if (err) console.error("DB connection error:", err);
    else console.log("DB connected");
});

app.get("/books", (req, res) => {
    const limit = parseInt(req.query.limit) || 7;
    const offset = parseInt(req.query.offset) || 0;

    const sort = req.query.sort || "price";
    const order = req.query.order || "DESC";

    const allowedSort = ["id", "price", "title"];
    const allowedOrder = ["ASC", "DESC"];

    const sortField = allowedSort.includes(sort) ? sort : "id";
    const orderDir = allowedOrder.includes(order) ? order : "DESC";

    const query = `SELECT * FROM ukr_mod_books ORDER BY ${sortField} ${orderDir} LIMIT ? OFFSET ?`;

    db.query(query, [limit, offset], (err, results) => {
        if (err) {
            console.log("SQL error:", err);
            return res.status(500).json({ error: err });
        }
        res.json(results);
    });
});

app.listen(5000, () => console.log("Server running on port 5000"));
