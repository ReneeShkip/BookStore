
import { useEffect, useState } from "react";
import Personal from "./personal";

function Header() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [isAuth, setIsAuth] = useState(false);
    const toggleMenu = () => setMenuOpen(prev => !prev);
    const handleLogout = () => {
        setIsAuth(false);
        setMenuOpen(false);
    };
    useEffect(() => {
        const toggle = document.querySelector(".search-toggle");
        const box = document.querySelector(".search-box");
        const closeBtn = document.querySelector(".close-search");
        const input = document.getElementById("search");

        toggle.addEventListener("click", () => {
            box.classList.add("open");
            box.querySelector("input").focus();
        });

        closeBtn.addEventListener("click", () => {
            input.value = "";
        });

        document.addEventListener("click", (e) => {
            if (!box.contains(e.target) && !toggle.contains(e.target)) {
                box.classList.remove("open");
            }
        });
    }, []);

    return (
        <header>
            <div className="logo">
                <img src="/svg/logo.svg" alt="Logo" />
                <a href="/">
                    <h1>Grafoman</h1>
                </a>
            </div>

            <div className="menu_container">
                <div className="search-wrapper">
                    <div className="search-box">
                        <input id="search" type="text" placeholder="Пошук..." />
                        <button className="close-search">&times;</button>
                    </div>
                    <button className="search-toggle">
                        <img src="/svg/search.svg" alt="search" />
                    </button>
                </div>
                <button><img src="/svg/filter.svg" alt="filter" /></button>
                <button><img src="/svg/cart.svg" alt="cart" /></button>
                <button className="profile-btn" onClick={toggleMenu}>
                    <img src="/svg/profile.svg" alt="profile" />
                </button>
                {menuOpen && (
                    <Personal
                        isAuth={isAuth}
                        onClose={() => setMenuOpen(false)}
                        onLogin={() => { setIsAuth(true); setMenuOpen(false); }}
                        onLogout={handleLogout}
                    />
                )}
            </div>

            <div className="post_menu">
                <button>Автори</button>
                <button>Видавництва</button>
            </div>
        </header>
    )
}

export default Header