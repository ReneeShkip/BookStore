import React, { useRef, useState } from "react";
import Loger from "./Loger";
import "../pages/css/loger.css"
export default function Log_in({ isAuth, onClose, onLoginSuccess, onLogout, onRegister }) {

    const handleLogin = async (login, password) => {
        try {
            const res = await fetch("http://localhost:5000/log_in", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ login, password }),
            });

            if (!res.ok) {
                const text = await res.text();
                console.warn("HTTP error:", res.status);
                console.log(text);
                return;
            }

            const data = await res.json();

            onLoginSuccess(data);
            onClose();
            onLogin(data);
        } catch (err) {
            console.error("Fetch error:", err);
        }
    };


    const [isOpen, setLogerOpen] = useState(false);
    const [mode, setmode] = useState("login");

    const openLogin = () => {
        setmode("login")
        setLogerOpen(true)
    }

    const openRegistr = () => {
        setmode("register")
        setLogerOpen(true)
    }

    return (
        <div className="personal-popup">

            {isAuth ? (
                <div>
                    <button>Особистий кабінет</button>
                    <button onClick={onLogout}>Вийти</button>
                </div>
            ) : (
                <div>
                    <button onClick={openLogin}>Вхід</button>
                    <button onClick={openRegistr}>Реєстрація</button>
                </div>
            )}

            {isOpen && (
                <Loger
                    mode={mode}
                    onClose={() => setLogerOpen(false)}
                    onLogin={handleLogin}
                    onRegister={onRegister}
                />
            )}
        </div>
    );
}

