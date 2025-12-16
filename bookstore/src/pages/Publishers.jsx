import { useEffect, useState } from "react";
import "../pages/css/publisher.css"

export default function Publishers() {
    const [publ, setPubl] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch('http://localhost:5000/publishers')
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch publishers');
                return res.json();
            })
            .then(data => {
                console.log("Publishers loaded:", data);
                setPubl(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error loading publishers:", err);
                setError(err.message);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <div className="child-page">Завантаження Видавництв...</div>;
    }

    if (error) {
        return <div className="child-page">Помилка: {error}</div>;
    }


    return (
        <div className="child-page">
            <div className="publishers_page">
                {publ.map((item) => (
                    <div className="logotype" key={item.ID}>
                        <img
                            src={`/img/publishers/${item.photo}`}
                            alt={item.name}
                        />
                        <div className="overlay">
                            {item.name}
                        </div>
                    </div>

                ))}

            </div>

        </div>
    )
}