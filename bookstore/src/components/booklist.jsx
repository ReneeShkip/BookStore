import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import '../pages/css/style.css';
import '../App.css';
import '../pages/css/catalog.css';

export default function BooksList({ category, categoryName }) {
    const [books, setBooks] = useState([]);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasNextPage, setHasNextPage] = useState(true);
    const pageSize = 7;

    useEffect(() => {
        fetch(`http://localhost:5000/books?category=${category}&limit=${pageSize + 1}&offset=${page * pageSize}`)
            .then(res => {
                if (res.status === 404) {
                    return <NotFound />
                }
                if (!res.ok) {
                    throw new Error("Server error");
                }
                return res.json();
            })
            .then(data => {
                if (data) {
                    setBooks(data);
                    setHasNextPage(data.length > pageSize);
                }
            })
            .catch(err => console.error(err));
    }, [page, category, pageSize]);

    useEffect(() => {
        setPage(0);
    }, [category]);

    useEffect(() => {

    }, [])

    const nextPage = () => setPage(prev => prev + 1);
    const prevPage = () => setPage(prev => Math.max(prev - 1, 0));

    if (loading) {
        return (
            <div className="catalog">
                <div className="catalog_section">
                    <div className="category">{categoryName || category}</div>
                    <div>Завантаження...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return <NotFound />;
    }

    return (
        <div className="catalog">
            <button onClick={prevPage} disabled={page === 0}>
                <img src="svg/prev.svg" alt="Назад" />
            </button>

            <div className="catalog_section">
                <div className="category">{categoryName || category}</div>

                {books.length === 0 ? (
                    <div>Книги не знайдено</div>
                ) : (
                    <>
                        <ul className="catalog_ul">
                            {books.map(book => (
                                <li
                                    className="catalog_li"
                                    key={`${category}_${book.ID}`}
                                >
                                    <NavLink to={`/book/details/${book.ID}`}>
                                        <img
                                            src={`/img/covers/${book.cover}`}
                                            alt={book.title}
                                            className={`book-cover ${book.type}`}
                                        />
                                        <div className="short_info">{book.title}</div>
                                        <div className="short_info">
                                            {book.price} грн
                                        </div>
                                    </NavLink>
                                </li>
                            ))}
                            {(books.length < 8 || page === 3) && (
                                <button className="show-more">
                                    Ще
                                </button>
                            )}
                        </ul>
                    </>
                )}
            </div>

            <button onClick={nextPage} disabled={!hasNextPage}>
                <img src="svg/next.svg" alt="Вперед" />
            </button>
        </div>
    );
}