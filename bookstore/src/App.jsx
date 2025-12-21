import { useState } from "react";
import Header from "./components/header";
import Footer from "./components/Footer";

import { Outlet } from "react-router-dom";

function App() {

  const [isAuth, setIsAuth] = useState(false);
  const [user, setUser] = useState(null);
  const [authError, setAuthError] = useState("");

  const handleRegister = async (userData) => {
    setAuthError("");

    try {
      const res = await fetch("http://localhost:5000/sign_up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Помилка реєстрації");
      }

      setUser(data);
      setIsAuth(true);
      return data;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  };

  const handleLogin = async (loginData) => {
    try {
      const res = await fetch("http://localhost:5000/log_in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData)
      });

      let data = {};
      try {
        data = await res.json();
      } catch {
        data = { error: "Сервер не відповів JSON" };
      }
      if (!res.ok) {
        setAuthError(data.error || "Невірний логін або пароль");
        return;
      }

      setUser(data);
      setIsAuth(true);
      setAuthError("");
    } catch (err) {
      console.error("Помилка запиту:", err);
      setAuthError("Помилка з'єднання з сервером");
    }
  };




  const handleLoginSuccess = (userData) => {
    setIsAuth(true);
    setUser(userData);
  };

  const handleLogout = () => {
    setIsAuth(false);
    setUser(null);
  };

  return (
    <div className="app-layout">
      <Header
        isAuth={isAuth}
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onRegister={handleRegister}
        authError={authError}
      />

      <main className="content">
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}

export default App;
