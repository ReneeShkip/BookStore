import { useState, useEffect } from "react";
import Header from "./components/header";
import Footer from "./components/Footer";
import { UserContext } from "./context/UserContext";
import { Outlet } from "react-router-dom";

function App() {

  const [isAuth, setIsAuth] = useState(false);
  const [user, setUser] = useState(null);
  const [authError, setAuthError] = useState("");

  // Перевірка localStorage при завантаженні
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setIsAuth(true); // Також встанови isAuth
    }
  }, []);

  const handleRegister = async (userData) => {
    setAuthError("");
    try {
      const res = await fetch("http://localhost:5000/sign_up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData)
      });

      // ✅ Спочатку парсимо JSON
      const data = await res.json();

      // ✅ Потім перевіряємо статус
      if (!res.ok) {
        throw new Error(data.error || data.details || "Помилка реєстрації");
      }

      // ✅ Зберігаємо тільки потрібні дані користувача
      const user = {
        id: data.id,
        login: data.login,
        first_name: data.first_name,
        last_name: data.last_name,
        phone_number: data.phone_number,
        role: data.role
      };

      setUser(user);
      setIsAuth(true);
      localStorage.setItem('user', JSON.stringify(user));

      return user;
    } catch (err) {
      console.error("Registration error:", err);
      setAuthError(err.message);
      throw err;
    }
  };

  const handleLogin = async (form) => {
    try {
      const res = await fetch("http://localhost:5000/log_in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (!res.ok) {
        setAuthError(data.error || "Невірний логін або пароль");
        return;
      }

      setUser(data);
      setIsAuth(true);
      localStorage.setItem('user', JSON.stringify(data)); // Виправлено: data замість userData
      setAuthError("");
    } catch (err) {
      console.error(err);
      setAuthError("Помилка з'єднання з сервером");
    }
  };

  const handleLogout = () => {
    setIsAuth(false);
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <UserContext.Provider value={{
      user,
      isAuth,
      handleLogin,
      handleRegister,
      handleLogout,
      authError
    }}>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </UserContext.Provider>
  );
}

export default App;