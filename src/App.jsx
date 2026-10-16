import { Link, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import ProductDetailsPage from './pages/ProductDetailsPage.jsx';

// Header stays visible. The matching route renders inside <main>.
export default function App() {
  return (
    <>
      <header className="site-header">
        <Link to="/" className="brand">Product Explorer</Link>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products/:id" element={<ProductDetailsPage />} />
          <Route path="*" element={<p className="notice">Page not found. <Link to="/">Back to products</Link></p>} />
        </Routes>
      </main>
    </>
  );
}
