import { useState, useContext, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import Loading from "../pages/Loading"
import CitySelector from "../components/city_selector";

export default function Order() {
    const { user, setUser } = useContext(UserContext);
    const [first_name, setFirstName] = useState(user?.first_name || "");
    const [last_name, setLastName] = useState(user?.last_name || "");
    const [phone_number, setPhone] = useState(user?.phone_number || "");
    const [city, setCity] = useState(user?.city || "");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [postomats, getPostomat] = useState([]);
    const [warehouses, getWarehouses] = useState([]);
    const [posta, setPosta] = useState([]);
    const [deliveryType, setDeliveryType] = useState("Нова пошта відділення");
    const [cityRef, setCityRef] = useState(null);

    const handleSelectCity = (option) => {
        setCity(option.Description);
        setCityRef(option.Ref);
    };
    const { state } = useLocation();
    const chosen = state?.items;
    if (loading) return <Loading />;
    if (!chosen) {
        return <div>Немає товарів для оформлення</div>;
    }
    console.log(chosen)
    const postDepartment = async (cityRef) => {
        try {
            const res = await fetch("http://localhost:5000/departments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ref: cityRef })
            });

            if (!res.ok) throw new Error("Помилка завантаження");

            const data = await res.json();

            const warehouses = data.filter(wh =>
                wh.Description.startsWith("Відділення")
            );
            const postomat = data.filter(wh =>
                wh.Description.startsWith("Поштомат")
            );

            getWarehouses(warehouses);
            getPostomat(postomat);
        } catch (err) {
            setError(err.message);
        }
    };


    useEffect(() => {
        fetch('http://localhost:5000/posta')
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch posta');
                return res.json();
            })
            .then(data => {
                setPosta(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error loading categories:", err);
                setError(err.message);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        if (user) {
            setFirstName(user.first_name);
            setLastName(user.last_name);
            setPhone(user.phone_number);
            setCity(user.city);
        }
        setLoading(false);
    }, [user]);


    useEffect(() => {
        if (!cityRef) return;
        postDepartment(cityRef);
    }, [cityRef]);

    return (
        <div className="order-page">
            <div className="info">
                <h1>Контактні дані</h1>
                <div className="profile_info">
                    <div className="prof">Ім'я<input key="info_name" value={first_name} onChange={e => setFirstName(e.target.value)} /></div>
                    <div className="prof">Прізвище<input key="info_last_name" value={last_name} onChange={e => setLastName(e.target.value)} /></div>
                    <div className="prof">Телефон<input key="info_phone" value={phone_number} onChange={e => setPhone(e.target.value)} /></div>
                    <CitySelector
                        city={city}
                        setCity={setCity}
                        onSelect={handleSelectCity}
                    />
                    <div className="prof">
                        Тип доставки
                        <select id="type" name="type" onChange={e => setDeliveryType(e.target.value)}>
                            {posta.map(item => {
                                return (
                                    <option key={`posta_${item.id}`}>{item.posta}</option>
                                )
                            })}

                        </select>
                    </div>
                    <div className="prof">
                        Відділення
                        <select>
                            {deliveryType === "Нова пошта відділення" ?
                                warehouses.map(dep => (
                                    <option key={dep.Ref}>
                                        {dep.Description}
                                    </option>
                                ))
                                :
                                postomats.map(dep => (
                                    <option key={dep.Ref}>
                                        {dep.Description}
                                    </option>
                                ))
                            }
                        </select>

                    </div>
                    <div className="prof"><input type="checkbox" /> Отримувач інша людина</div>
                </div>
            </div>{chosen.map(ch => (
                <div key={`book_${ch.title}`} className="books-section">
                    <h2>{ch.title}</h2>
                    <div className="sub_book_info">
                        <img src={`img/covers/${ch.cover}`} alt={ch.title} />
                        <div>
                            <h4>{ch.first_name} {ch.last_name}</h4>
                            <h4>Тип: {ch.type}</h4>
                            <h4>Ціна: {ch.price * ch.quantity}</h4>
                            <h4>Кількість: {ch.quantity}</h4>
                        </div>
                    </div>
                </div>
            ))}
        </div >
    )
}