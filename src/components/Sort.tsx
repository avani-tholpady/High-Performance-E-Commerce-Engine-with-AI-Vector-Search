interface SortProps {
  sort: string;
  setSort: (value: string) => void;
}

function Sort({ sort, setSort }: SortProps) {
  return (
    <div style={{ margin: "20px 0" }}>
      <label>Sort By: </label>

      <select
        value={sort}
        onChange={(e) => setSort(e.target.value)}
      >
        <option value="">Default</option>
        <option value="low-high">Price: Low → High</option>
        <option value="high-low">Price: High → Low</option>
        <option value="a-z">Name: A → Z</option>
        <option value="z-a">Name: Z → A</option>
      </select>
    </div>
  );
}

export default Sort;