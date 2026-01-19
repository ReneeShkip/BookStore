import { useParams } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { normalizeAurhor } from "../utils/normalizedauthors";
import { NavLink } from "react-router-dom";
import Loading from "./Loading";
import "../pages/css/details.css";

export default function AuthorDetails() {
    const { id } = useParams();
    const [author, setAuthor] = useState(null);
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
                    const { first_name, last_name, biography, photo, links } = data[0];
                    setAuthor(normalizeAurhor(data));
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

    if (loading) return <Loading />;
    if (!author) return <h2>Author not found</h2>;
    return (
        <div className="author-details">
            <img src={`/img/authors/${author.photo}`} alt="" />
            <div className="info">
                <h1>{author.first_name} {author.last_name}</h1>
                <p>{author.biography}</p>
                {author.books.length > 0 && (
                    <div className="books">
                        <div className="soc">
                            <div>Соц. мережі</div>
                            {author.links === "Відсутні" ? author.links :
                                <a href={author.links} className="au_short_info link">

                                    {author.links.includes("tiktok") ? "tiktok" : "instagram"}
                                </a>}
                        </div>
                        <h2>Твори цього автора</h2>
                        <ul className="listbook">
                            {author.books.map(book => (
                                <li className="option_book" key={book.id}>
                                    <div className="au_short_info">{book.title}</div>
                                    <div className="au_short_info" key={0}>
                                        {book.types.map(btype => (
                                            <NavLink
                                                key={btype.book_type_id}
                                                to={`/book/details/${btype.book_type_id}`}
                                            >
                                                <div className="au_short_info">
                                                    {btype.type}
                                                </div>
                                            </NavLink>
                                        ))}
                                    </div>
                                    <div className="au_short_info">{book.year}</div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div >
    )
}
