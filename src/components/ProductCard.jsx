import { Link } from 'react-router-dom';
import { label, money } from '../utils/format.js';

// One clickable product: image, category, title, rating, and price.
export default function ProductCard({ product }) {
  const image = product.thumbnail || product.images?.[0];

  return (
    <Link to={`/products/${product.id}`} className="card">
      <img src={image} alt={product.title} />
      <span className="chip">{label(product.category)}</span>
      <h2>{product.title}</h2>
      <p>{Number(product.rating).toFixed(2)} / 5</p>
      <strong>{money(product.price)}</strong>
    </Link>
  );
}
