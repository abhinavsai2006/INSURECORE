import axios from 'axios';

const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    // On Vercel or any live domain, ALWAYS use relative '/api/v1' on current host
    if (host.includes('vercel.app') || host !== 'localhost') {
      return '/api/v1';
    }
  }
  return 'http://localhost:5000/api/v1';
};

export const api = axios.create({
  baseURL: getBaseUrl(),
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Refresh token handling for 401
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const res = await axios.post(`${getBaseUrl()}/auth/refresh`, {}, { withCredentials: true });
        const newToken = res.data.data.token;
        localStorage.setItem('token', newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshErr) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Helper to download authenticated PDF or Excel binary files
 */
export async function downloadFile(endpointUrl: string, defaultFilename: string) {
  try {
    const response = await api.get(endpointUrl, {
      responseType: 'blob',
    });

    const blob = new Blob([response.data], {
      type: (response.headers['content-type'] as string) || 'application/pdf',
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;

    const disposition = response.headers['content-disposition'];
    let filename = defaultFilename;
    if (disposition && typeof disposition === 'string' && disposition.includes('filename=')) {
      const match = disposition.match(/filename="?([^";]+)"?/);
      if (match && match[1]) filename = match[1];
    }

    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (err: any) {
    console.error('File download failed:', err);
    const token = localStorage.getItem('token');
    const fullUrl = `${getBaseUrl()}${endpointUrl}${endpointUrl.includes('?') ? '&' : '?'}token=${token}`;
    window.open(fullUrl, '_blank');
  }
}