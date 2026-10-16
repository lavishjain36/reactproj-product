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
