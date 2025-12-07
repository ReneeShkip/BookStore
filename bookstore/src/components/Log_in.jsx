import React, { useRef, useState } from "react";
import Loger from "./Loger";
import "../pages/css/loger.css"
export default function Log_in({ isAuth, onClose, onLogin, onLogout }) {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");


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
                    <button>Вийти</button>
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
                    onLogin={onLogin}
                />
            )}
        </div>
    );
}

