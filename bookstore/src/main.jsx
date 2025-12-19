import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import Catalog from "./pages/Catalog";
import Authors from "./pages/Authors";
import Publishers from "./pages/Publishers";
import AuthorDetails from "./pages/Author_Details";
import BookDetails from "./pages/Book_Details.jsx";
import NotFound from "./pages/notfound.jsx";
import SetBooks from "./pages/Set_of_books.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <NotFound />,
    children: [
      { index: true, element: <Catalog /> },
      { path: "authors", element: <Authors /> },
      { path: "publishers", element: <Publishers /> },
      { path: "author/details/:id", element: <AuthorDetails /> },
      { path: "book/details/:id", element: <BookDetails /> },
      { path: "/books/filtered", element: < SetBooks /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />
);


