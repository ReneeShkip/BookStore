import { useContext } from "react";
import { useState, useEffect } from "react";
import Loading from "./Loading.jsx";
import { normalizeHistory } from "../utils/normalizedhistory";
import { UserContext } from "../context/UserContext";
import './css/profile.css';

async function editInfo(user) {
    const response = await fetch("http://localhost:5000/edit_info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update info");
    }

    return response.json();
}

export default function MyProfile() {
    const { user, setUser } = useContext(UserContext);

    const [login, setLogin] = useState(user?.login || "");
    const [first_name, setFirstName] = useState(user?.first_name || "");
    const [last_name, setLastName] = useState(user?.last_name || "");
    const [phone_number, setPhone] = useState(user?.phone_number || "");
    const [city, setCity] = useState(user?.city || "");
    const [email, setEmail] = useState(user?.email || "");
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (user) {
            setLogin(user.login);
            setFirstName(user.first_name);
            setLastName(user.last_name);
            setPhone(user.phone_number);
            setCity(user.city);
            setEmail(user.email);
        }
        console.log(user);
        setLoading(false);
    }, [user]);

    useEffect(() => {
        if (!user) return;

        fetch(`http://localhost:5000/history?user_id=${user.id}`)
            .then(res => res.json())
            .then(data => setHistory(normalizeHistory(data)))
            .catch(console.error);
    }, [user]);
    console.log(history)
    if (!user) {
        return (
            <div className="cart_page">
                <div className="alternative">
                    <img src="/svg/notAuth.svg" alt="not-auth" />
                    <h2>Ви не авторизовані</h2>
                </div>
            </div>
        );
    }

    if (loading) { return <Loading />; }

    return (
        <div className="profil-page">
            <div className="profile_info_section">
                <h2>Особиста інформація</h2>
                <div className="profile_info">
                    <div className="prof">Логін<input value={login} onChange={e => setLogin(e.target.value)} /></div>
                    <div className="prof">Ім'я<input value={first_name} onChange={e => setFirstName(e.target.value)} /></div>
                    <div className="prof">Прізвище<input value={last_name} onChange={e => setLastName(e.target.value)} /></div>
                    <div className="prof">Телефон<input value={phone_number} onChange={e => setPhone(e.target.value)} /></div>
                    <div className="prof">Місто<input value={city} onChange={e => setCity(e.target.value)} /></div>
                    <div className="prof">Пошта<input value={email} onChange={e => setEmail(e.target.value)} /></div>
                    <button className="edit" onClick={async () => {
                        const updatedUser = {
                            id: user.id,
                            login,
                            first_name,
                            last_name,
                            phone_number,
                            city,
                            email,
                            role: user.role
                        };

                        try {
                            await editInfo(updatedUser);
                            setUser(updatedUser);
                            localStorage.setItem('user', JSON.stringify(updatedUser));
                            alert("Дані оновлено");
                        } catch (e) {
                            setError(e.message);
                            alert("Помилка: " + e.message);
                        }
                    }}>
                        Змінити
                    </button>
                    <button className="deleter">Видалити обліковий запис</button>
                </div>
            </div>
            <div className="profile_info_section">
                <h2>Історія замовлень</h2>
                {history.map(order => {
                    const formatted = new Date(order.date).toLocaleDateString("uk-UA");
                    return (
                        <div key={`order_${order.id}`} className="item">
                            <div className="order-date">
                                Дата замовлення: {formatted}
                                <div className="status">
                                    Статус: {order.status}
                                </div>
                            </div>

                            <div className="order">
                                {order.books.map(book => (
                                    <div key={`book_${book.book_id}`} className="book-item">
                                        <div className="book-title">{book.title}</div>
                                        <div className="book-author">{book.author}</div>
                                        <div className="book-quantity">{book.quantity} шт</div>
                                        <div className="book-price">{book.price} грн</div>
                                        <div className="book-type">{book.type}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
}