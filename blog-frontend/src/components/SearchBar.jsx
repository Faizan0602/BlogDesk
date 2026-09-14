function SearchBar({ value, onChange, onClear, loading = false }) {
  return (
    <div className="search-bar" role="search">
      <label htmlFor="blog-search">Search blogs</label>
      <div className="search-control">
        <input
          id="blog-search"
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Search by title"
          autoComplete="off"
        />
        {value && (
          <button className="button button-secondary" type="button" onClick={onClear} disabled={loading}>
            Clear
          </button>
        )}
      </div>
    </div>
  );
}

export default SearchBar;
