import { FiSearch, FiX } from "react-icons/fi";
import "../styles/search.css";

const Search = ({ currentPath, onClose, query, setQuery }) => {

  const handleSearch = (e) => {
    e.preventDefault();
    // Search happens live as user types, so no need to do anything on submit
  };

  return (
    <form className="search-form" onSubmit={handleSearch}>
      <FiSearch className="search-icon" />
      <input
        type="text"
        placeholder={`Search on ${currentPath}`}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="search-input"
        autoFocus
      />
      <FiX className="close-icon" onClick={onClose} />
    </form>
  );
};

export default Search;
