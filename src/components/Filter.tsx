interface FilterProps {
  category: string;
  setCategory: (value: string) => void;
}

function Filter({ category, setCategory }: FilterProps) {
  return (
    <select
      value={category}
      onChange={(e) => setCategory(e.target.value)}
    >
      <option value="">All Categories</option>
      <option value="Electronics">Electronics</option>
      <option value="Fashion">Fashion</option>
      <option value="Books">Books</option>
    </select>
  );
}

export default Filter;