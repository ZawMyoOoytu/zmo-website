import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook to handle any async API call
 * @param {Function} apiFunction - The async function to call (e.g., authAPI.login)
 * @param {boolean} immediate - Whether to call it immediately on mount
 * @returns {Object} { data, loading, error, execute }
 */
export const useApi = (apiFunction, immediate = true) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Wrap the API function
  const execute = useCallback(
    async (...args) => {
      try {
        setLoading(true);
        setError(null);
        const result = await apiFunction(...args);

        // Handle both Axios response objects and custom API objects
        if (result?.data) {
          setData(result.data);
        } else {
          setData(result);
        }

        return result;
      } catch (err) {
        // Capture meaningful error messages
        const errMsg =
          err.response?.data?.message || // Backend error message
          err.message ||                  // JS error message
          'Something went wrong';
        setError(errMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiFunction]
  );

  // Call immediately on mount if requested
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { data, loading, error, execute };
};
