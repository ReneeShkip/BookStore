import '../css/style.css'
import '../css/App.css'
import '../css/catalog.css'
import BooksList from './booklist'

function Catalog() {
    return (
        <div className="catalog">
            <button><img src="svg/prev.svg" alt="prev" /></button>
            <BooksList />
            <button><img src="svg/next.svg" alt="next" /></button>
        </div>
    )
}

export default Catalog