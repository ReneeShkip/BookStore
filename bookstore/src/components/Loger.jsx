import { useEffect, useState, useRef } from "react";

export default function Loger({ mode, onClose, onLogin }) {

    const ToggleRef = useRef(null);
    const [isClosed, setClose] = useState(false);

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
                        ? <div>
                            <h2>Вхід</h2>
                            <div className="input_section">
                                <input className="inputs" type="text" placeholder="Логін" />
                                <input className="inputs" type="password" placeholder="Пароль" />
                                <button className="button_enter">Увійти</button>
                            </div>
                        </div>
                        : <div>
                            <h2>Реєстрація</h2>
                            <div className="input_section">
                                <input className="inputs" type="text" placeholder="Логін" />
                                <input className="inputs" type="text" placeholder="Пароль" />
                                <input className="inputs" type="text" placeholder="Пошта" />
                                <input className="inputs" type="text" placeholder="Номер телефону" />
                                <button className="button_sign">Зареєструватись</button>
                            </div>
                        </div>}
                </div>
            </div>
        </div>
    );
}