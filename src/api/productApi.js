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
