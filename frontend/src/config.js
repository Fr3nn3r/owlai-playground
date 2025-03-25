// Get API URL from environment or use a default for tests
const getApiUrl = () => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env.VITE_API_URL;
  }
  return 'http://test-api'; // Default for tests
};

const config = {
  API_URL: getApiUrl()
};

export default config; 