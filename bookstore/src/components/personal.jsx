import { useEffect, useRef } from "react";
import './css/personal.css'
export default function UserMenu({ isAuth, onClose, onLogin, onLogout }) {
    const menuRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(e) {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                onClose();
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    return (
        <div className="user-menu" ref={menuRef}>
            {!isAuth ? (
                <>
                    <button onClick={onLogin}>Вхід</button>
                    <button onClick={() => alert("Реєстрація в процесі...")}>
                        Реєстрація
                    </button>
                </>
            ) : (
                <>
                    <button onClick={() => alert("Перейти в кабінет")}>
                        Мій кабінет
                    </button>
                    <button onClick={onLogout}>Вихід</button>
                </>
            )}
        </div>
    );
}
