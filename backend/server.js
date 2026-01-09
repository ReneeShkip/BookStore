require('dotenv').config();
const nodemailer = require('nodemailer');
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const { use } = require("react");

const app = express();

/*const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});

transporter.verify((error, success) => {
    if (error) {
        console.log('❌ Email connection error:', error);
    } else {
        console.log('✅ Email server is ready');
    }
});*/

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
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
    const { book_id, authorId, limit = 20, offset = 0 } = req.query;

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

    if (book_id) {
        conditions.push("bt.book_id = (SELECT book_id FROM book_type WHERE id = ?)");
        params.push(book_id);
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
        `SELECT id, login, first_name, last_name, phone_number, password, role, email, city FROM users WHERE login = ? LIMIT 1`,
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
            res.json({
                id: user.id,
                login: user.login,
                first_name: user.first_name,
                last_name: user.last_name,
                phone_number: user.phone_number,
                role: user.role,
                email: user.email,
                city: user.city
            });
        }
    );
});


app.post("/sign_up", async (req, res) => {
    const { login, password, first_name, last_name, phone_number, role } = req.body || {};

    if (!login || !password) {
        return res.status(400).json({ error: "Login or password missing" });
    }

    const query = `INSERT INTO users(first_name, last_name, login, password, phone_number, role) VALUES(?, ?, ?, ?, ?, ?)`;

    db.query(query, [first_name, last_name, login, password, phone_number, role], (err, results) => {
        if (err) {
            return res.status(500).json({ error: "Server error", details: err.message });
        }

        res.json({
            message: "User registered successfully",
            login,
            id: results.insertId,
            first_name,
            last_name,
            phone_number,
            role
        });
    });
});

app.get("/filteredbooks", (req, res) => {
    const isSearch = req.query.search === "true";
    const q = req.query.q?.trim() || "";

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

    if (q) {
        sql += `
            AND (
                b.title LIKE ?
                OR a.first_name LIKE ?
                OR a.last_name LIKE ?
            )
        `;
        values.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }

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

app.get("/comments/:bookType", (req, res) => {
    const { bookType } = req.params;

    const sql = `
        SELECT c.id, c.date_post, c.caption, c.sub_rate, c.user_id, u.login
        FROM comments c
        JOIN users u ON u.id = c.user_id
        WHERE c.book_id = (SELECT book_id FROM book_type WHERE id = ?)
        ORDER BY c.date_post DESC
    `;

    db.query(sql, [bookType], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "DB error" });
        }
        res.json(results);
    });
});

app.post("/new_comm", (req, res) => {

    const { user_id, book_id, caption, sub_rate, date_post } = req.body || {};

    if (!user_id || !book_id || !caption || !sub_rate) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    let mysqlDate;
    if (date_post) {
        mysqlDate = new Date(date_post).toISOString().slice(0, 19).replace('T', ' ');
    } else {
        mysqlDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
    }

    const query = `
        INSERT INTO comments(user_id, book_id, caption, sub_rate, date_post)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(query, [user_id, book_id, caption, sub_rate, mysqlDate], (err, results) => {
        if (err) {
            console.error("SQL error:", err);
            return res.status(500).json({ error: "Database error", details: err.message });
        }
        res.json({ message: "Comment added!", comment: { caption, sub_rate } });
    });
});

app.get("/cart", (req, res) => {
    const user_id = req.query.user_id;

    if (!user_id) {
        return res.status(400).json({ error: "No user_id provided" });
    }

    const query = `
       SELECT
        c.id,
        bt.id AS id,
        b.title,
        b.cover,
        bt.price,
        a.first_name,
        a.last_name,
        c.quantity,
        t.type
        FROM cart c
        JOIN book_type bt ON bt.id = c.book_id
        JOIN books b ON b.id = bt.book_id
        JOIN authors a ON a.id = b.author
        JOIN type t ON t.id = bt.type_id
        LEFT JOIN order_books ob ON c.id = ob.cart_id
        WHERE ob.cart_id IS NULL and c.user_id = ?
        ORDER BY c.id DESC;
    `;

    db.query(query, [user_id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "DB error" });
        }
        res.json(results);
    });
});

app.post("/add_cart", (req, res) => {

    const { user_id, book_id, quantity } = req.body;

    if (!user_id || !book_id) {
        return res.status(400).json({
            error: "Missing required fields",
            received: { user_id, book_id }
        });
    }

    const checkQuery = `
        SELECT * FROM cart 
        WHERE user_id = ? AND book_id = ?
    `;

    db.query(checkQuery, [user_id, book_id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Server error" });
        }

        if (results.length > 0) {
            const newQuantity = results[0].quantity + (quantity || 1);

            db.query(
                `UPDATE cart SET quantity = ? WHERE id = ?`,
                [newQuantity, results[0].id],
                (err) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).json({ error: "Server error" });
                    }
                    res.json({ message: "Quantity updated" });
                }
            );
        } else {
            db.query(
                `INSERT INTO cart (user_id, book_id, quantity)
                 VALUES (?, ?, ?)`,
                [user_id, book_id, quantity || 1],
                (err) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).json({ error: "Server error" });
                    }
                    res.json({ message: "Added to cart" });
                }
            );
        }
    });
});

app.put("/cart/:id", (req, res) => {
    const { id } = req.params;
    const { user_id, quantity } = req.body;

    const query = `
        UPDATE cart 
        SET quantity = ? 
        WHERE book_id = ? AND user_id = ?
    `;

    db.query(query, [quantity, id, user_id], (err, results) => {
        if (err) {
            console.error("SQL error:", err);
            return res.status(500).json({ error: "Server error" });
        }
        res.json({ message: "Quantity updated" });
    });
});

app.delete("/cart/:id", (req, res) => {
    const { id } = req.params;
    const { user_id } = req.query;

    const query = `DELETE FROM cart
            WHERE book_id = ? and user_id = ?
            AND id NOT IN (
                SELECT cart_id FROM order_books
            );
`;

    db.query(query, [id, user_id], (err) => {
        if (err) {
            console.error("SQL error:", err);
            return res.status(500).json({ error: "Server error" });
        }
        console.log(id, user_id);
        res.json({ message: "Item removed" });
    });
});

app.delete("/cart", (req, res) => {
    const { user_id } = req.query;

    const query = `DELETE FROM cart
        WHERE user_id = ?
        AND id NOT IN (
            SELECT cart_id FROM order_books
        );`;

    db.query(query, [user_id], (err, result) => {
        if (err) {
            console.error("SQL error:", err);
            return res.status(500).json({ error: "Server error" });
        }

        res.json({ deleted: result.affectedRows });
    });
});

app.get("/history", (req, res) => {
    const user_id = Number(req.query.user_id);

    const query = `
        SELECT
        o.id as id,
        c.id AS cart_id,
        bt.id AS ID,
        b.title,
        bt.price,
        concat(a.first_name, ' ', a.last_name) as author,
        c.quantity,
        t.type,
        s.status,
        o.date_and_time
    FROM orders o
    JOIN order_books ob ON ob.order_id = o.id
    JOIN cart c ON ob.cart_id = c.id
    JOIN book_type bt ON bt.id = c.book_id
    JOIN books b ON b.id = bt.book_id
    JOIN authors a ON a.id = b.author
    JOIN users u ON u.id = c.user_id
    JOIN type t ON t.id = bt.type_id
    JOIN statuses s ON s.id = o.status_id
    WHERE u.id = ?
    ORDER BY o.date_and_time DESC;
    `;


    db.query(query, [user_id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "DB error" });
        }
        res.json(results);
    });
});

app.post("/edit_info", (req, res) => {
    const { id, first_name, last_name, login, phone_number, email, city } = req.body;

    if (!id) {
        return res.status(400).json({ error: "User id is required" });
    }

    db.query(
        `UPDATE users
         SET first_name = ?, last_name = ?, login = ?, phone_number = ?, email = ?, city = ?
         WHERE id = ?`,
        [first_name, last_name, login, phone_number, email, city, id],
        (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: "Server error" });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: "User not found" });
            }

            res.json({ message: "User info updated" });
        }
    );
});

app.get("/posta", (req, res) => {
    const query = `select id, posta from posta`;

    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "DB error" });
        }
        res.json(results);
    });
})

app.post("/departments", async (req, res) => {
    const { ref } = req.body;

    try {
        const response = await fetch("https://api.novaposhta.ua/v2.0/json/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                "apiKey": process.env.NOVA_POSHTA_API_KEY,
                "modelName": "AddressGeneral",
                "calledMethod": "getWarehouses",
                "methodProperties": {
                    "CityRef": ref
                }
            })
        });

        const data = await response.json();

        if (!data.success) {
            return res.status(400).json({ error: data.errors });
        }

        res.json(data.data);
    } catch (err) {
        res.status(500).json({ error: "Nova Poshta API error" });
    }
});

app.post("/city", async (req, res) => {
    const { city } = req.body;

    try {
        const response = await fetch("https://api.novaposhta.ua/v2.0/json/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                "apiKey": process.env.NOVA_POSHTA_API_KEY,
                "modelName": "AddressGeneral",
                "calledMethod": "getCities",
                "methodProperties": {
                    "FindByString": city
                }
            })
        });
        const data = await response.json();

        if (!data.success) {
            return res.status(400).json({ error: data.errors });
        }

        res.json(data.data);
    } catch (err) {
        res.status(500).json({ error: "Nova Poshta API error" });
    }
});


app.listen(5000, () => console.log("Server running on port 5000"));