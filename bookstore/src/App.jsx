import { useState, useEffect } from "react";
import Header from "./components/header";
import Footer from "./components/Footer";
import { Outlet } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { UserProvider } from "./context/UserContext.jsx";


function App() {

  const [isAuth, setIsAuth] = useState(false);
  const [user, setUser] = useState(null);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setIsAuth(true);
    }
  }, []);

  return (
    <UserProvider>
      <CartProvider>
        <div className="page">
          <Header />

          <main>
            <Outlet />
          </main>

          <Footer />
        </div>
      </CartProvider>
    </UserProvider>
  );
}

export default App;