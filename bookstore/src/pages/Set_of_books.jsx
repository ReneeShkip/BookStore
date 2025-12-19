import { useLocation } from "react-router-dom";

export default function SetBooks() {
    const { state } = useLocation();
    const filters = state?.filters;

    useEffect(() => {
        fetch(`http://localhost:5000/langs`)
            .then(res => {
                if (res.status === 404) {
                    return <NotFound />
                }
                if (!res.ok) {
                    throw new Error("Server error");
                }
                return res.json();
            })
            .then(data => {
                if (data) {
                    setLang(data)
                }
            })
            .catch(err => console.error(err));
    }, []);

    return (
        <div className="child-page">
            <div className="books-page">
                OO
            </div>
        </div>
    );
}
