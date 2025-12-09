import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Catalog from "./pages/Catalog";
import Authors from "./pages/Authors";
import Publishers from "./pages/Publishers";
import Footer from "./components/Footer";

function App() {
  return (
    <BrowserRouter>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Catalog />} />
          <Route path="/authors" element={<Authors />} />
          <Route path="/publishers" element={<Publishers />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
