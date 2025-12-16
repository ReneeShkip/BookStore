import { useParams } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import "../pages/css/details.css";

export default function AuthorDetails() {
    const { id } = useParams();
    const [author, setAuthor] = useState(null);
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);

    const limit = 7;
    const offset = 0;

    useEffect(() => {
        if (!id) return;

        const fetchData = async () => {
            try {
                const res = await fetch(`http://localhost:5000/authors_books?authorId=${id}&limit=${limit}&offset=${offset}`);
                if (!res.ok) throw new Error("Failed to fetch books");
                const data = await res.json();

                if (data.length > 0) {
                    const { first_name, last_name, biography, photo } = data[0];
                    setAuthor({ first_name, last_name, biography, photo });
                    setBooks(data);
                } else {
                    const authorRes = await fetch(`http://localhost:5000/authors?id=${id}`);
                    if (!authorRes.ok) throw new Error("Failed to fetch author");
                    const authorData = await authorRes.json();
                    setAuthor(authorData[0] || null);
                    setBooks([]);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    if (loading) return <h2>Loading author...</h2>;
    if (!author) return <h2>Author not found</h2>;

    return (
        <div className="author-details">
            <img src={`/img/authors/${author.photo}`} alt="" />
            <div className="info">
                <h1>{author.first_name} {author.last_name}</h1>
                <p>{author.biography}</p>
                {books.length > 0 && (
                    <div className="books">
                        <h2>Твори цього автора</h2>
                        <ul className="listbook">
                            {books.map(book => (
                                <li className="option_book" key={book.book_type_id}>
                                    <NavLink to={`/book/details/${book.book_id}`}>
                                        <div className="au_short_info">{book.title}</div>
                                        <div className="au_short_info">{book.year}</div>
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    )
}
