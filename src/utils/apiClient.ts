/**
 * API Client Utility with Session Expiration Handling
 * 
 * This utility wraps fetch calls and automatically handles:
 * - Adding authentication headers
 * - Detecting session expiration
 * - Redirecting to login on session expiry
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    sessionExpired?: boolean;
    data?: T;
    [key: string]: any;
}

/**
 * Make an authenticated API request
 */
export async function apiClient<T = any>(
    endpoint: string,
    options: RequestInit = {}
): Promise<ApiResponse<T>> {
    const token = localStorage.getItem('inferno_token');

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });

        const data = await response.json();

        // Handle session expiration
        if (response.status === 401 && data.sessionExpired) {
            // Clear local storage
            localStorage.removeItem('inferno_user');
            localStorage.removeItem('inferno_token');

            // Redirect to login
            window.location.href = '/login?session_expired=true';

            throw new Error(data.message || 'Session expired. Please login again.');
        }

        // Handle other errors
        if (!response.ok) {
            throw new Error(data.message || `HTTP error! status: ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

/**
 * Convenience methods for common HTTP verbs
 */
export const api = {
    get: <T = any>(endpoint: string, options?: RequestInit) =>
        apiClient<T>(endpoint, { ...options, method: 'GET' }),

    post: <T = any>(endpoint: string, body?: any, options?: RequestInit) =>
        apiClient<T>(endpoint, {
            ...options,
            method: 'POST',
            body: body ? JSON.stringify(body) : undefined,
        }),

    put: <T = any>(endpoint: string, body?: any, options?: RequestInit) =>
        apiClient<T>(endpoint, {
            ...options,
            method: 'PUT',
            body: body ? JSON.stringify(body) : undefined,
        }),

    delete: <T = any>(endpoint: string, options?: RequestInit) =>
        apiClient<T>(endpoint, { ...options, method: 'DELETE' }),
};

export default api;
