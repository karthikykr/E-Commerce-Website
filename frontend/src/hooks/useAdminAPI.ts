import { useState, useCallback } from 'react';
import api from '@/lib/axios'; // adjust path if needed

const useAdminAPI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(async (method, url, data = {}, options = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api({
        method,
        url,
        data,
        ...options,
      });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Shorthand methods
  const getCategories = useCallback(( options ) => request('get', '/category', {}, options), [request]);

  // const post = useCallback((url, data, options) => request('post', url, data, options), [request]);
  // const put = useCallback((url, data, options) => request('put', url, data, options), [request]);
  // const del = useCallback((url, options) => request('delete', url, {}, options), [request]);

  return { get, post, put, del, loading, error };
};

export default useApi;
