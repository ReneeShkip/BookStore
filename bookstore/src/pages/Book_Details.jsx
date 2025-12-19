import { useParams, NavLink, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import "../pages/css/details.css";
import { normalizeBook } from "../utils/normalizebooks";

export default function BookDetails() {
    const { id } = useParams();
    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    function TextMore({ text }) {
        const [expanded, setExpanded] = useState(false);
        const lim = 200;
        const isLong = text.length > lim;
        const displaytext = expanded ? text : text.slice(0, lim);

        return (
            <p>
                {displaytext}
                {isLong && !expanded && "..."}
                {isLong && (
                    <button onClick={() => setExpanded(!expanded)} className="morebtn">
                        {expanded ? "менше" : "більше"}
                    </button>
                )}
            </p>
        );
    }

    const limit = 2;
    const offset = 0;

    useEffect(() => {
        if (!id) return;

        const fetchData = async () => {
            try {
                const res = await fetch(
                    `http://localhost:5000/authors_books?bookId=${id}&limit=${limit}&offset=${offset}`
                );

                if (res.status === 404) {
                    navigate("/404");
                    return;
                }

                if (!res.ok) throw new Error("Failed to fetch books");

                const data = await res.json();

                if (!data || data.length === 0) {
                    navigate("/404");
                    return;
                }

                const normalized = normalizeBook(data);
                setBook(normalized);
            } catch (err) {
                console.error(err);
                navigate("/404");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    if (loading) return <h2>Loading book...</h2>;
    if (!book) return <h2>Book not found</h2>;

    return (
        <div className="author-details">
            <img src={`/img/covers/${book.cover}`} alt={book.title} className="book-cover" />
            <ul className="types">
                {book.types.map((t) => (
                    <li key={t.book_type_id} className="type_item">
                        <label>
                            <input
                                name="type"
                                type="radio"
                                value={t.book_type_id}
                                className="hidden_checkbox"
                                disabled={t.availability == "Нема"}
                            />
                            <div className="checkbox_button">
                                <div>{t.type}</div>
                                {t.availability == "Нема" ?
                                    <div> <h4>Нема в наявності</h4></div>
                                    :
                                    <div>{t.price} грн</div>
                                }

                            </div>
                        </label>
                    </li>
                ))}
            </ul>

            <div className="info">
                <h1>{book.title}</h1>
                <TextMore text={book.annotation} />

                <ul className="books">
                    <li className="option_book">
                        <NavLink to={`/author/details/${book.author.id}`}>
                            <div className="au_short_info">Автор</div>
                            <div className="au_short_info" style={{ color: "#254C69" }}>
                                {book.author.first_name} {book.author.last_name}
                            </div>
                        </NavLink>
                    </li>

                    <li className="option_book">
                        <div className="au_short_info">Рік</div>
                        <div className="au_short_info">{book.year}</div>
                    </li>

                    <li className="option_book">
                        <div className="au_short_info">Видавництво</div>
                        <div className="au_short_info">{book.publisher}</div>
                    </li>

                    <li className="option_book">
                        <div className="au_short_info">Мова</div>
                        <div className="au_short_info">{book.language}</div>
                    </li>
                </ul>

            </div>
        </div>
    );
}
