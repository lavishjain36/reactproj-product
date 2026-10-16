import { useEffect, useRef, useState } from 'react';
import { fetchCategories, fetchProducts, PAGE_SIZE } from '../api/productApi.js';
import CategoryFilter from '../components/CategoryFilter.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import Loading from '../components/Loading.jsx';
import Pagination from '../components/Pagination.jsx';
import ProductList from '../components/ProductList.jsx';
import SearchBar from '../components/SearchBar.jsx';
import { useRequest } from '../hooks/useRequest.js';

const SORTS = [
  ['rating:desc', 'Top rated'],
  ['price:asc', 'Price: low to high'],
  ['price:desc', 'Price: high to low'],
  ['title:asc', 'Name: A to Z'],
  ['title:desc', 'Name: Z to A'],
];

export default function HomePage() {
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('rating:desc');
  const [page, setPage] = useState(1);
  // Remembers the last search that was actually sent, so a repeat does not reload.
  const appliedQuery = useRef('');

  const [sortBy, order] = sort.split(':');

  // Wait until typing pauses, then search from page 1.
  useEffect(() => {
    const timer = setTimeout(() => {
      const next = search.trim();
      if (appliedQuery.current === next) return;
      appliedQuery.current = next;
      setQuery(next);
      setPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  // Categories load once. Products reload when the filters or page change.
  const categoriesRequest = useRequest(fetchCategories, []);
  const productsRequest = useRequest(
    (signal) => fetchProducts({ search: query, category, sortBy, order, page }, signal),
    [query, category, sort, page],
  );

  const products = productsRequest.data?.products || [];
  const total = productsRequest.data?.total || 0;
  const filtersAreOn = query !== '' || category !== 'all' || sort !== 'rating:desc';

  function chooseCategory(value) {
    setCategory(value);
    setPage(1);
  }

  function chooseSort(value) {
    setSort(value);
    setPage(1);
  }

  function clearFilters() {
    appliedQuery.current = '';
    setSearch('');
    setQuery('');
    setCategory('all');
    setSort('rating:desc');
    setPage(1);
  }

  let results = null;
  if (productsRequest.status === 'loading') {
    results = <Loading label="Loading products" />;
  } else if (productsRequest.status === 'error') {
    results = <ErrorMessage message={productsRequest.error} onRetry={productsRequest.retry} />;
  } else if (products.length === 0) {
    results = (
      <div className="notice">
        <p>No products found.</p>
        {filtersAreOn ? <button type="button" onClick={clearFilters}>Clear filters</button> : null}
      </div>
    );
  } else {
    const start = (page - 1) * PAGE_SIZE + 1;
    const end = Math.min(page * PAGE_SIZE, total);
    results = (
      <>
        <p className="muted">Showing {start}–{end} of {total}</p>
        <ProductList products={products} />
        <Pagination page={page} total={total} pageSize={PAGE_SIZE} onPageChange={setPage} />
      </>
    );
  }

  return (
    <section>
      <h1>Products</h1>
      <div className="toolbar">
        <SearchBar value={search} onChange={setSearch} />
        <CategoryFilter
          categories={categoriesRequest.data || []}
          value={category}
          onChange={chooseCategory}
        />
        <label>
          Sort
          <select value={sort} onChange={(event) => chooseSort(event.target.value)}>
            {SORTS.map(([value, name]) => (
              <option key={value} value={value}>{name}</option>
            ))}
          </select>
        </label>
      </div>

      {categoriesRequest.status === 'error' ? <p className="muted">{categoriesRequest.error}</p> : null}
      {results}
    </section>
  );
}
