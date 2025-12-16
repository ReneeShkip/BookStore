import React, { useEffect, useState, useRef } from "react";
import { NavLink, Link } from "react-router-dom";
import Log_in from "./Log_in";

export default function Header({ isAuth, user, onLoginSuccess, onLogout, onRegister }) {

    const [menuOpen, setMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);

    const searchBoxRef = useRef(null);
    const searchToggleRef = useRef(null);
    const searchInputRef = useRef(null);

    const menuRef = useRef(null);
    const btnRef = useRef(null);


    const toggleMenu = () => setMenuOpen(prev => !prev);

    useEffect(() => {
        if (!searchOpen) return;

        searchInputRef.current?.focus();

        const handleClickOutside = (e) => {
            if (
                searchBoxRef.current &&
                !searchBoxRef.current.contains(e.target) &&
                searchToggleRef.current &&
                !searchToggleRef.current.contains(e.target)
            ) {
                setSearchOpen(false);
            }
        };

        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);

    }, [searchOpen]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(e.target) &&
                btnRef.current &&
                !btnRef.current.contains(e.target)
            ) {
                setMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);


    return (
        <header>
            <div className="logo">
                <Link to="/">
                    <img src="/svg/logo.svg" alt="Logo" />
                    <h1>Grafoman</h1>
                </Link>
            </div>

            <div className="menu_container">

                <div className="search-wrapper">
                    <div
                        ref={searchBoxRef}
                        className={`search-box ${searchOpen ? "open" : ""}`}
                    >
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Пошук..."
                        />
                        <button className="close-search" onClick={() => setSearchOpen(false)}>
                            &times;
                        </button>
                    </div>

                    <button
                        ref={searchToggleRef}
                        className="search-toggle"
                        onClick={() => setSearchOpen(prev => !prev)}
                    >
                        <img src="/svg/search.svg" alt="search" />
                    </button>
                </div>

                <button>
                    <img src="/svg/filter.svg" alt="filter" />
                </button>

                <button>
                    <img src="/svg/cart.svg" alt="cart" />
                </button>

                <button
                    className="profile-btn"
                    ref={btnRef}
                    onClick={toggleMenu}
                >
                    {isAuth ? (
                        <img src="/img/users/admin.png" alt="admin" />
                    ) : (
                        <img src="/svg/profile.svg" alt="profile" />
                    )}
                </button>

                {menuOpen && (
                    <div ref={menuRef}>
                        <Log_in
                            isAuth={isAuth}
                            onClose={() => setMenuOpen(false)}
                            onLoginSuccess={onLoginSuccess}
                            onLogout={onLogout}
                            onRegister={onRegister}
                        />
                    </div>
                )}
            </div>

            <div className="post_menu">
                <NavLink to="/">Каталог</NavLink>
                <NavLink to="/authors">Автори</NavLink>
                <NavLink to="/publishers">Видавництва</NavLink>
            </div>

        </header>
    );
}
