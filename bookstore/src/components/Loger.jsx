import { useEffect, useState, useRef } from "react";

export default function Loger({ mode, onClose, onLogin, onRegister }) {

    const ToggleRef = useRef(null);
    const [isClosed, setClose] = useState(false);
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const [first_name, setfName] = useState("");
    const [lastname, setlName] = useState("");
    const [phone, setPhone] = useState("");
    const [role, setRole] = useState("client");


    const handleRegist = (e) => {
        e.preventDefault();
        onRegister({ login, first_name, lastname, password, phone, role });
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        onLogin(login, password);
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                ToggleRef.current &&
                !ToggleRef.current.contains(e.target)
            ) {
                setClose(true);
                onClose?.();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);

    }, [onClose]);

    if (isClosed) return null;

    return (
        <div>
            <div className="modal_loger" ref={ToggleRef}>
                <button className="closer" onClick={() => {
                    setClose(true);
                    onClose?.();
                }}>
                    ✖
                </button>
                <div className="log_section">
                    {mode == "login"
                        ? <form onSubmit={handleSubmit}>
                            <h2>Вхід</h2>

                            <div className="input_section">
                                <input
                                    name="login" className="inputs" type="text" placeholder="Логін" value={login}
                                    onChange={(e) => setLogin(e.target.value)}
                                    autoComplete="username"
                                />

                                <input
                                    name="password" className="inputs" type="password" placeholder="Пароль"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoComplete="current-password"
                                />

                                <button className="button_enter" type="submit">
                                    Увійти
                                </button>
                            </div>
                        </form>

                        : <form onSubmit={handleRegist}>
                            <h2>Реєстрація</h2>
                            <div className="input_section">
                                <input name="login" className="inputs" type="text" placeholder="Логін" value={login} onChange={(e) => setLogin(e.target.value)} />
                                <input value={first_name} className="inputs" placeholder="Ім'я" onChange={(e) => setfName(e.target.value)} />
                                <input name="last_name" className="inputs" type="text" placeholder="Прізвище" value={lastname} onChange={(e) => setlName(e.target.value)} />
                                <input name="password" className="inputs" type="text" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} />
                                <input name="phone" className="inputs" type="text" placeholder="Номер телефону" value={phone} onChange={(e) => setPhone(e.target.value)} />

                                <button className="button_sign" type="submit">Зареєструватись</button>
                            </div>
                        </form>}
                </div>
            </div>
        </div>
    );
}