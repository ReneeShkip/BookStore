import { useState } from "react";
import Header from "./components/header";
import Footer from "./components/Footer";

import { Outlet } from "react-router-dom";

function App() {

  const handleRegister = async (userData) => {
    const res = await fetch("http://localhost:5000/sign_up", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData)
    });

    if (res.ok) {
      const data = await res.json();
      setUser(data);
      setIsAuth(true);
    }
  };
  const [isAuth, setIsAuth] = useState(false);
  const [user, setUser] = useState(null);

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
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}
        onRegister={handleRegister}
      />

      <main className="content">
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}

export default App;
