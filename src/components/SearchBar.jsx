// Controlled search box. The parent stores the text and decides when to fetch.
export default function SearchBar({ value, onChange }) {
  return (
    <label>
      Search
      <input
        type="search"
        value={value}
        placeholder="Search products"
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
