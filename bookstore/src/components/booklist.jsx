import { useEffect, useState } from "react";
import '../css/style.css';
import '../css/App.css';
import '../css/catalog.css';

function BooksList({ category, categoryName }) {
    const [books, setBooks] = useState([]);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const pageSize = 7;

    useEffect(() => {
        if (!category) return;

        setLoading(true);
        setError(null);

        fetch(`http://localhost:5000/books?category=${category}&limit=${pageSize}&offset=${page * pageSize}`)
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch books');
                return res.json();
            })
            .then(data => {
                console.log(data);
                setBooks(data);
                setHasMore(data.length === pageSize);
                setLoading(false);
            })
            .catch(err => {
                console.error("Fetch error:", err);
                setError(err.message);
                setLoading(false);
            });
    }, [page, category]);

    useEffect(() => {
        setPage(0);
    }, [category]);

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
        return (
            <div className="catalog">
                <div className="catalog_section">
                    <div className="category">{categoryName || category}</div>
                    <div className="error">Помилка: {error}</div>
                </div>
            </div>
        );
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
                    <ul>
                        {books.map(book => (
                            <li key={`${category}_${book.ID}`}>
                                <img src={`/img/covers/${book.cover}`} alt={book.title} />
                                <div>{book.title}</div>
                                <div>{book.price} грн</div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <button onClick={nextPage} disabled={!hasMore}>
                <img src="svg/next.svg" alt="Вперед" />
            </button>
        </div>
    );
}

export default BooksList;