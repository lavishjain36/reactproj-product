import ProductCard from './ProductCard.jsx';

// Renders the current page of products as a grid.
export default function ProductList({ products }) {
  return (
    <div className="grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
