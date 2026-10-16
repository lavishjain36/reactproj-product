import { label } from '../utils/format.js';

// Controlled category menu. "all" means no category filter.
export default function CategoryFilter({ categories, value, onChange }) {
  return (
    <label>
      Category
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="all">All categories</option>
        {categories.map((category) => {
          const slug = category.slug || category;
          const name = category.name || label(slug);
          return <option key={slug} value={slug}>{name}</option>;
        })}
      </select>
    </label>
  );
}
