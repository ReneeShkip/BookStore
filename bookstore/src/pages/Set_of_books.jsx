import { useLocation, NavLink } from "react-router-dom";
import { useState, useEffect } from "react";

import "../pages/css/filtered_books.css"

export default function SetBooks() {
    const { state } = useLocation();
    const filters = state?.filters;

    const [allbooks, setAllBooks] = useState([]);
    const [sortBy, setSortBy] = useState("");

    useEffect(() => {
        if (!filters) return;

        const params = new URLSearchParams();

        if (filters.genres?.length) {
            params.set("genres", filters.genres.join(","));
        }

        if (filters.types?.length) {
            params.set("types", filters.types.join(","));
        }

        if (filters.langs?.length) {
            params.set("langs", filters.langs.join(","));
        }

        if (filters.price?.min) {
            params.set("minPrice", filters.price.min);
        }

        if (filters.price?.max) {
            params.set("maxPrice", filters.price.max);
        }
        fetch(`http://localhost:5000/filteredbooks?${params.toString()}`)
            .then(res => {
                if (!res.ok) throw new Error("Server error");
                return res.json();
            })
            .then(data => setAllBooks(data))
            .catch(err => console.error(err));

    }, [filters]);

    const sortedBooks = [...allbooks].sort((a, b) => {
        if (sortBy === "price") {
            return a.price - b.price;
        }

        if (sortBy === "title") {
            return a.title.localeCompare(b.title, "uk");
        }

        if (sortBy === "availability") {
            return (b.availability === "Є") - (a.availability === "Є");
        }

        return 0;
    });

    return (
        <div className="child-page">
            <div className="sorting">
                <h4>Сортувати за</h4>
                <select id="lang" name="lang"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}>
                    <option value="">...</option>
                    <option value="price">ціною</option>
                    <option value="title">назвою</option>
                    <option value="availability">наявністю</option>
                </select>
            </div>
            <div className="books-page">
                <ul className="catalog_ul book_ul">
                    {sortedBooks.length > 0 ?
                        sortedBooks.map(book => (
                            <li
                                className="catalog_li book_li"
                                key={`${book.ID}`}
                            >
                                {book.availability === "Нема" ? <div className="dis">
                                    <img
                                        src={`/img/covers/${book.cover}`}
                                        alt={book.title}
                                        className={`book-cover ${book.type}`}
                                    />
                                    <div className="short_info">{book.title}</div>
                                    <div className="short_info">
                                        {book.price} грн
                                    </div></div> :
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
                                }
                            </li>
                        ))
                        :
                        <div><p>За вашим запитом нічого не знайдено</p></div>}
                </ul>
            </div>
        </div>
    );
}
