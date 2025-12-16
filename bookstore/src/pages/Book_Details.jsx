import { useParams, NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import "../pages/css/details.css";

export default function BookDetails() {
    const { id } = useParams();
    const [author, setAuthor] = useState(null);
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const limit = 100;
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

                if (data.length > 0) {
                    setBooks(data);

                    const { first_name, last_name, biography, photo, author_id } = data[0];
                    setAuthor({ first_name, last_name, biography, photo, author_id });
                } else {
                    const authorRes = await fetch(`http://localhost:5000/authors?id=${id}`);

                    if (authorRes.status === 404) {
                        navigate("/404");
                        return;
                    }

                    const authorData = await authorRes.json();
                    setAuthor(authorData[0] || null);
                    setBooks([]);
                }
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
    if (!books.length || !author) return <h2>Book not found</h2>;

    const book = books[0];

    return (
        <div className="author-details">
            <img src={`/img/covers/${book.cover}`} alt="" />
            <div className="info">
                <h1>{book.title}</h1>
                <p>{book.annotation}</p>
                <div className="books">
                    <ul>
                        <li className="option_book">
                            <NavLink to={`/author/details/${author.author_id}`}>
                                <div className="au_short_info">Автор</div>
                                <div className="au_short_info">{author.first_name} {author.last_name}</div>
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
                    </ul>


                </div>
            </div>
        </div>
    );
}
