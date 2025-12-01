import { useEffect, useState } from "react";
import '../css/style.css';
import '../css/App.css';
import '../css/catalog.css';

function BooksList() {
    const [books, setBooks] = useState([]);
    const [page, setPage] = useState(0);
    const pageSize = 7;

    useEffect(() => {
        fetch(`http://localhost:5000/books?limit=${pageSize}&offset=${page * pageSize}`, { cache: "no-store" })
            .then(res => res.json())
            .then(data => setBooks(data))
            .catch(err => console.error("Fetch error:", err));
    }, [page]);
    const nextPage = () => setPage(prev => prev + 1);
    const prevPage = () => setPage(prev => Math.max(prev - 1, 0));

    return (
        <div className="catalog">
            <button onClick={prevPage} disabled={page === 0}>
                Prev
            </button>

            <div className="catalog_section">
                <ul>
                    {books.map(book => (
                        <li key={book.ID}>
                            <img src={`/img/covers/${book.cover}`} alt={book.title} />
                            <div>{book.title}</div>
                            <div>{book.price} грн</div>
                        </li>
                    ))}
                </ul>
            </div>

            <button onClick={nextPage}>Next</button>
        </div>
    );
}

export default BooksList