interface SearchBarProps {
  search: string;
  setSearch: (value: string) => void;
}

function SearchBar({ search, setSearch }: SearchBarProps) {
  return (
    <input
      type="text"
      placeholder="Search products..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      style={{
        padding: "10px",
        width: "300px",
        marginBottom: "20px",
      }}
    />
  );
}

export default SearchBar;