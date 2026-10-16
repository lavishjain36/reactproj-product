# Product Explorer — mentor lesson guide

A responsive React + Vite catalog that loads live products from the [DummyJSON Products API](https://dummyjson.com/docs/products). Requests use **Axios**. Learners build the app in the order below. After every step, run the app and check the result before continuing.

## What the finished app does

- Shows product image, title, price (INR), rating, and category.
- Searches, filters by category, sorts, and paginates.
- Opens a product details page with React Router.
- Shows loading, error (with Retry), empty, and success states.
- Cancels an outdated request with `AbortController` so a slow response cannot overwrite a newer one.

## Final folder structure

```text
product-explorer/
├── index.html
├── package.json
├── vite.config.js
├── README.md
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    ├── api/productApi.js
    ├── hooks/useRequest.js
    ├── utils/format.js
    ├── pages/
    │   ├── HomePage.jsx
    │   └── ProductDetailsPage.jsx
    └── components/
        ├── ProductCard.jsx
        ├── ProductList.jsx
        ├── SearchBar.jsx
        ├── CategoryFilter.jsx
        ├── Loading.jsx
        ├── ErrorMessage.jsx
        └── Pagination.jsx
```

## Prerequisites

- Node.js 18 or newer
- A browser
- A code editor

Teach this idea first: **the screen does not own HTTP**. Components display data. `src/api/productApi.js` talks to DummyJSON. `src/hooks/useRequest.js` handles loading, errors, retry, and cancellation.

## Run the finished app

```bash
npm install
npm run dev
```

Open the local URL Vite prints, usually http://localhost:5173/.

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create the production bundle in `dist` |
| `npm run preview` | Serve the production bundle locally |

---

## Step 1 — Create the Vite app and install libraries

**Teach:** Vite serves the app in development and bundles it for production. React Router will switch pages without a full browser reload. Axios will call the API.

From an empty folder:

```bash
npm create vite@latest . -- --template react
npm install
npm install react-router-dom axios
npm run dev
```

`package.json` should include:

```json
{
  "name": "product-explorer",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "axios": "^1.20.0",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "react-router-dom": "^7.6.2"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.5.2",
    "vite": "^6.3.5"
  }
}
```

`vite.config.js`:

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Starts the dev server and builds the production bundle.
export default defineConfig({
  plugins: [react()],
});
```

`index.html` is the only HTML page. React will render inside `#root`.

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta
      name="description"
      content="Browse, search, and filter products from the DummyJSON catalog."
    />
    <title>Product Explorer</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

**Check:** the Vite welcome page opens and the browser console has no red errors.

---

## Step 2 — Mount React and turn on routing

**Teach:** `createRoot` starts React. `BrowserRouter` watches the URL. `StrictMode` runs effects twice in development so forgotten cleanup shows up early.

Replace `src/main.jsx` with:

```jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';

// BrowserRouter enables <Link>, <Routes>, and useParams() in the rest of the app.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
```

**Check:** the page still loads.

---

## Step 3 — Add routes before any product data

**Teach:** Build the shell first. A header stays on every page. Each route renders one page. A `*` route catches unknown addresses.

Create two placeholder pages.

`src/pages/HomePage.jsx`

```jsx
export default function HomePage() {
  return <h1>Products</h1>;
}
```

`src/pages/ProductDetailsPage.jsx`

```jsx
export default function ProductDetailsPage() {
  return <h1>Product details</h1>;
}
```

`src/App.jsx`

```jsx
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
          <Route
            path="*"
            element={<p className="notice">Page not found. <Link to="/">Back to products</Link></p>}
          />
        </Routes>
      </main>
    </>
  );
}
```

**Check:**

- `/` shows “Products”.
- `/products/1` shows “Product details”.
- `/anything-else` shows “Page not found”.
- The brand link returns home.

`:id` is a URL parameter. Step 10 reads it with `useParams()`.

---

## Step 4 — Add the stylesheet

**Teach:** One CSS file is enough for this app. Class names in later components must match these selectors. The grid is 4 columns, then 2, then 1.

Replace `src/index.css` with:

```css
/* Page colors, type, and the shared box model. */
:root {
  color: #1c1915;
  background: #f3efe6;
  font-family: "Segoe UI", sans-serif;
  line-height: 1.5;
}

* { box-sizing: border-box; }
body { margin: 0; }
h1, h2, p { margin: 0; }
a { color: inherit; }
button, input, select { font: inherit; color: inherit; }
button { cursor: pointer; }
img { display: block; width: 100%; object-fit: cover; }

/* Header and page width. */
.site-header, main {
  width: min(1100px, calc(100% - 2rem));
  margin: 0 auto;
}
.site-header { padding: 1rem 0; }
.brand { font-size: 1.3rem; font-weight: 700; text-decoration: none; }
main { padding-bottom: 3rem; }
h1 { font-size: clamp(1.8rem, 3vw, 2.4rem); margin-bottom: 1rem; }

/* Search, category, and sort sit on one row, then stack on a phone. */
.toolbar {
  display: grid;
  grid-template-columns: 1.4fr 1fr 1fr;
  gap: 0.75rem;
  margin-bottom: 1rem;
}
label { display: flex; flex-direction: column; gap: 0.3rem; font-size: 0.85rem; font-weight: 700; }
input, select {
  min-height: 2.7rem;
  padding: 0.5rem 0.7rem;
  border: 1px solid #e3d9cc;
  border-radius: 10px;
  background: #fffdf8;
  font-weight: 500;
}

/* Product cards: 4 columns, then 2, then 1. */
.grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.9rem;
}
.card {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 0.7rem;
  text-decoration: none;
  background: #fffdf8;
  border: 1px solid #e3d9cc;
  border-radius: 14px;
}
.card img { aspect-ratio: 4 / 3; border-radius: 8px; background: #efe7dc; }
.card h2 { font-size: 1rem; }
.chip, .eyebrow { color: #0f6b5c; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; }
.muted, .status { color: #6d645c; margin: 0.4rem 0 0.8rem; }

/* Product details: image beside the description. */
.details {
  display: grid;
  grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr);
  gap: 1.2rem;
  align-items: start;
}
.details img { border-radius: 14px; background: #fffdf8; }
.price { margin: 0.5rem 0; font-size: 1.3rem; font-weight: 700; }
.back-link { display: inline-block; margin-bottom: 1rem; font-weight: 700; color: #0a4f44; }

/* Empty, error, and page controls. */
.notice, .pager { margin: 1rem 0; }
.notice {
  padding: 1rem;
  text-align: center;
  background: #fffdf8;
  border: 1px solid #e3d9cc;
  border-radius: 14px;
}
.notice p { margin-bottom: 0.7rem; }
.notice button, .pager button {
  min-height: 2.4rem;
  padding: 0.35rem 0.8rem;
  border: 1px solid #e3d9cc;
  border-radius: 999px;
  background: #fff;
  font-weight: 700;
}
.notice button { background: #0f6b5c; color: white; border-color: #0f6b5c; }
.pager { display: flex; justify-content: center; align-items: center; gap: 0.7rem; }
button:disabled { opacity: 0.45; cursor: not-allowed; }
button:focus-visible, input:focus, select:focus { outline: 3px solid rgba(15, 107, 92, 0.35); }

@media (max-width: 900px) {
  .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .details, .toolbar { grid-template-columns: 1fr; }
}
@media (max-width: 520px) {
  .grid { grid-template-columns: 1fr; }
}
```

**Check:** the header is centered and the page background is warm off-white. Resize the window later, after cards exist.

---

## Step 5 — Format price and category names

**Teach:** Keep display rules out of components so the card and the details page look the same.

`src/utils/format.js`

```js
// Example: 9.99 -> ₹9.99
export function money(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'INR',
  }).format(Number(value) || 0);
}

// Example: "home-decoration" -> "Home Decoration"
export function label(value) {
  return String(value || '')
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
```

**Check:** in a temporary `console.log`, `money(9.99)` prints a rupee amount and `label('home-decoration')` prints `Home Decoration`. Remove that log afterward.

---

## Step 6 — Call DummyJSON with Axios

**Teach:** Components must not call `axios` themselves. One module owns the base URL, error messages, and which endpoint to use.

DummyJSON endpoints used here:

| Need | Request |
| --- | --- |
| All products, one page | `GET /products?limit=12&skip=0&sortBy=rating&order=desc` |
| Search | `GET /products/search?q=phone&limit=12&skip=0` |
| One category | `GET /products/category/smartphones?limit=12&skip=0` |
| Categories | `GET /products/categories` |
| One product | `GET /products/1` |

`skip` is the pagination offset. Page 1 skips 0. Page 2 skips 12. Page 3 skips 24.

Axios throws on HTTP 404 and 500. It also throws `ERR_CANCELED` when an `AbortSignal` cancels the call. The helper below turns those into messages the UI can show, and turns a cancel into `AbortError` so the screen can ignore it.

Create `src/api/productApi.js`:

```js
// Talks to DummyJSON through Axios. Components call these functions instead of requesting directly.

import axios from 'axios';

const api = axios.create({
  baseURL: 'https://dummyjson.com',
});

// Products shown on one catalog page.
export const PAGE_SIZE = 12;

// Axios throws for HTTP errors. This turns those, network failures, and cancels into clear errors.
async function request(url, signal) {
  try {
    // signal lets the caller cancel this request when a newer one starts.
    const response = await api.get(url, { signal });
    return response.data;
  } catch (error) {
    if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') {
      const cancelled = new Error('Request cancelled');
      cancelled.name = 'AbortError';
      throw cancelled;
    }
    if (error.response) {
      const { status, statusText } = error.response;
      throw new Error(`Request failed (${status} ${statusText}).`);
    }
    throw new Error('Network error. Check your connection and try again.');
  }
}

// Category dropdown options: [{ slug, name, url }, ...]
export async function fetchCategories(signal) {
  const data = await request('/products/categories', signal);
  if (!Array.isArray(data)) {
    throw new Error('Unexpected response from the categories API.');
  }
  return data;
}

// One product for the details page.
export function fetchProductById(id, signal) {
  return request(`/products/${id}`, signal);
}

// Used when search and category must be sorted in the browser.
function compareProducts(sortBy, order) {
  const direction = order === 'desc' ? -1 : 1;

  return (a, b) => {
    if (typeof a[sortBy] === 'string') {
      return String(a[sortBy]).localeCompare(String(b[sortBy])) * direction;
    }
    return (a[sortBy] - b[sortBy]) * direction;
  };
}

// Picks the DummyJSON URL for the current filters.
function productListUrl({ query, category, sortBy, order, limit, skip }) {
  const params = new URLSearchParams({
    limit: String(limit),
    skip: String(skip),
    sortBy,
    order,
  });

  if (query) {
    params.set('q', query);
    return `/products/search?${params}`;
  }

  if (category !== 'all') {
    return `/products/category/${encodeURIComponent(category)}?${params}`;
  }

  return `/products?${params}`;
}

// Returns one page: { products, total }.
export async function fetchProducts(
  { search = '', category = 'all', sortBy = 'rating', order = 'desc', page = 1, limit = PAGE_SIZE },
  signal,
) {
  const query = search.trim();
  const skip = (page - 1) * limit;

  // DummyJSON cannot search and filter by category in one request.
  if (query && category !== 'all') {
    const data = await request(
      `/products/search?q=${encodeURIComponent(query)}&limit=0`,
      signal,
    );
    const matches = (data.products || [])
      .filter((product) => product.category === category)
      .sort(compareProducts(sortBy, order));

    return {
      products: matches.slice(skip, skip + limit),
      total: matches.length,
    };
  }

  const data = await request(
    productListUrl({ query, category, sortBy, order, limit, skip }),
    signal,
  );

  if (!Array.isArray(data.products)) {
    throw new Error('Unexpected response from the products API.');
  }

  return {
    products: data.products,
    total: data.total || 0,
  };
}
```

**Mentor point for the combined filter:** if the learner selects both a search word and a category, the code loads every search match (`limit=0`), keeps that category, sorts, then slices the current page. The server still does search, sort, and paging when only one of those filters is set.

**Check:** paste this in the browser console.

```js
fetch('https://dummyjson.com/products?limit=2').then((r) => r.json()).then(console.log)
```

The object has `products` and `total`.

---

## Step 7 — Write one hook for loading, error, retry, and cancel

**Teach:** Both pages need the same four states. A custom hook prevents copying that `useEffect` twice.

Rules to say out loud:

1. Start in `loading`.
2. On success, store `data` and set `success`.
3. On failure, store `error` and set `error`.
4. If the user changes filters, abort the old request.
5. If a response arrives after abort, do not call `setState`.
6. Retry means “run the effect again”.

`src/hooks/useRequest.js`

```jsx
import { useEffect, useState } from 'react';

// Loads data for a screen.
// Pass a function that receives an AbortSignal, plus the values that should reload it.
export function useRequest(request, deps) {
  const [status, setStatus] = useState('loading');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    async function load() {
      setStatus('loading');
      setError('');

      try {
        const result = await request(controller.signal);
        // Ignore this result if a newer request already replaced it.
        if (!active) return;
        setData(result);
        setStatus('success');
      } catch (requestError) {
        if (!active || requestError.name === 'AbortError') return;
        setData(null);
        setError(requestError.message || 'Something went wrong.');
        setStatus('error');
      }
    }

    load();

    // Stop the in-flight request before the next search, filter, or page change.
    return () => {
      active = false;
      controller.abort();
    };
  }, [...deps, attempt]);

  return {
    status,
    data,
    error,
    retry: () => setAttempt((count) => count + 1),
  };
}
```

`deps` is the list of values that should reload the data, such as `[query, category, sort, page]`. `attempt` is included so Retry changes a dependency and the effect runs again.

**Check:** this file has no screen yet. The home page in Step 9 is the first real check.

---

## Step 8 — Build the reusable components

**Teach:** These components only display props. They do not call the API. That makes them easy to reuse and easy to explain.

### 8.1 Loading

`src/components/Loading.jsx`

```jsx
// Shown while a request is in progress.
export default function Loading({ label = 'Loading…' }) {
  return <p className="status" role="status">{label}</p>;
}
```

`role="status"` lets a screen reader announce the message.

### 8.2 Error and Retry

`src/components/ErrorMessage.jsx`

```jsx
// Shown when a request fails. Retry runs the same request again.
export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="notice" role="alert">
      <p>{message}</p>
      {onRetry ? <button type="button" onClick={onRetry}>Retry</button> : null}
    </div>
  );
}
```

### 8.3 Search box

`src/components/SearchBar.jsx`

```jsx
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
```

**Mentor point:** this is a controlled input. React state is the source of truth. The input does not keep its own copy.

### 8.4 Category menu

`src/components/CategoryFilter.jsx`

```jsx
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
```

The option value is the slug, such as `smartphones`, because that is what the API URL expects.

### 8.5 Product card

`src/components/ProductCard.jsx`

```jsx
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
```

### 8.6 Product list

`src/components/ProductList.jsx`

```jsx
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
```

`key` must be the product id. Do not use the array index. Index keys break when the page changes.

### 8.7 Pagination

`src/components/Pagination.jsx`

```jsx
// Previous / next controls. Hidden when every product fits on one page.
export default function Pagination({ page, total, pageSize, onPageChange }) {
  const pageCount = Math.ceil(total / pageSize);
  if (pageCount <= 1) return null;

  return (
    <nav className="pager" aria-label="Pagination">
      <button type="button" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        Previous
      </button>
      <span>Page {page} of {pageCount}</span>
      <button type="button" disabled={page >= pageCount} onClick={() => onPageChange(page + 1)}>
        Next
      </button>
    </nav>
  );
}
```

**Check before wiring the API:** temporarily render one fake card on the home page.

```jsx
<ProductCard
  product={{
    id: 1,
    title: 'Phone',
    category: 'smartphones',
    price: 499,
    rating: 4.5,
    thumbnail: 'https://cdn.dummyjson.com/product-images/smartphones/iphone-5s/thumbnail.webp',
  }}
/>
```

Clicking it must open `/products/1`. Delete the fake product when the real list works.

---

## Step 9 — Build the catalog page

**Teach:** The home page owns filter state. It asks the hook for data, then chooses one of four screens: loading, error, empty, or the product grid.

State to introduce one variable at a time:

| State | Meaning |
| --- | --- |
| `search` | The letters currently in the box |
| `query` | The text actually sent to Axios, after a 400ms pause |
| `category` | `'all'` or a category slug |
| `sort` | A value such as `price:asc` |
| `page` | The current page, starting at 1 |

Why two search values: updating `query` on every key would fire one request per letter. The effect waits 400ms. `appliedQuery` remembers the last sent text so the same search does not reload.

Replace `src/pages/HomePage.jsx` with:

```jsx
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
```

**Why category and sort reset the page:** page 5 of all products is not a valid page for a small category. Setting the page to 1 in the same event avoids requesting an empty slice.

**Check, in this order:**

1. About 12 products appear, with image, title, price, rating, and category.
2. Next shows the next 12. Previous goes back. The first Previous button is disabled.
3. Choosing a category changes the list and returns to page 1.
4. Typing `phone` waits a moment, then shows matches.
5. Changing sort reorders the list.
6. Searching for `zzzz-not-a-product` shows “No products found” and Clear filters.
7. In DevTools, set the network to Offline, refresh, and confirm the error plus Retry. Turn the network back on and click Retry.
8. Resize below 900px and below 520px. The toolbar stacks and the grid becomes 2 columns, then 1.

---

## Step 10 — Build the product details page

**Teach:** The id comes from the URL, not from a prop. `useParams()` returns `{ id: '1' }` for `/products/1`. Convert it to a number before calling the API. Reject ids such as `abc` or `0` without making a request.

Replace `src/pages/ProductDetailsPage.jsx` with:

```jsx
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
```

**Check:**

1. Click a card. The URL becomes `/products/1` (or another id) and the details match that card.
2. Refresh the details URL. It still loads, because the id is in the address.
3. Click “Back to products”.
4. Open `/products/abc` and `/products/0`. Both show “That product link is not valid.”
5. Open `/products/999999`. DummyJSON returns 404, and Retry is visible.

Leaving the page aborts the details request because `useRequest` cleans up on unmount.

---

## Step 11 — Final lesson checks

Walk through these with the learner:

1. Search `phone`, then choose Smartphones. Both filters apply.
2. Change the sort. The page returns to 1.
3. Type quickly. In the Network tab, the previous Axios call is cancelled and only the paused search remains.
4. A category with few products hides pagination.
5. Unknown routes show the not-found message.
6. `npm run build` completes with no errors.

## Concepts to ask the learner

- Why is Axios in `productApi.js` instead of inside `ProductCard`?
- Why does `fetch` throw only on network failure, while Axios also throws on a 404?
- What does `skip` mean on page 3 when the page size is 12?
- Why do we keep both `search` and `query`?
- What would go wrong if cleanup did not call `controller.abort()`?
- Why is `product.id` the React key?

## Suggested teaching order if time is short

1. Steps 1–3: a routed shell.
2. Step 6 and a temporary `console.log` of `fetchProducts`.
3. Steps 8.5 and 9 with only the product list, no filters.
4. Add search, then category, then sort, then pagination.
5. Step 7 can be introduced when the second page needs the same loading logic. If you prefer, write the `useEffect` on the home page first, then move it into the hook before the details page.
