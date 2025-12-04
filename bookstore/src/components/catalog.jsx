import { useEffect, useState } from "react";
import '../css/style.css';
import '../css/App.css';
import '../css/catalog.css';
import BooksList from './booklist';

function Catalog() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch('http://localhost:5000/categories')
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch categories');
                return res.json();
            })
            .then(data => {
                console.log("Categories loaded:", data);
                setCategories(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error loading categories:", err);
                setError(err.message);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <div className="main-page">Завантаження категорій...</div>;
    }

    if (error) {
        return <div className="main-page">Помилка: {error}</div>;
    }

    return (
        <div className="main-page">
            {categories.map(category => (
                <BooksList
                    key={category.id}
                    category={category.id}
                    categoryName={category.name}
                />
            ))}
        </div>
    );
}

export default Catalog;