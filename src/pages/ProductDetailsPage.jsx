import { Link, useParams } from 'react-router-dom';
import { fetchProductById } from '../api/productApi.js';
import ErrorMessage from '../components/ErrorMessage.jsx';
import Loading from '../components/Loading.jsx';
import { useRequest } from '../hooks/useRequest.js';
import { label, money } from '../utils/format.js';

// Reads :id from the URL and loads that product.
export default function ProductDetailsPage() {
  const { id } = useParams();
  const productId = Number(id);
  const validId = Number.isInteger(productId) && productId > 0;

  const { status, data: product, error, retry } = useRequest((signal) => {
    if (!validId) {
      return Promise.reject(new Error('That product link is not valid.'));
    }
    return fetchProductById(productId, signal);
  }, [id]);

  return (
    <section>
      <Link to="/" className="back-link">← Back to products</Link>

      {status === 'loading' ? <Loading label="Loading product" /> : null}
      {status === 'error' ? <ErrorMessage message={error} onRetry={retry} /> : null}

      {status === 'success' && product ? (
        <article className="details">
          <img src={product.thumbnail || product.images?.[0]} alt={product.title} />
          <div>
            <p className="eyebrow">{label(product.category)}</p>
            <h1>{product.title}</h1>
            <p className="price">{money(product.price)} · {Number(product.rating).toFixed(2)} / 5</p>
            <p>{product.description}</p>
            <p className="muted">{product.brand || 'Unbranded'} · {product.stock} in stock</p>
          </div>
        </article>
      ) : null}
    </section>
  );
}
