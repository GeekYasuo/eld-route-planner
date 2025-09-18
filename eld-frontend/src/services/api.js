// src/services/api.js
const API_BASE_URL = 'http://127.0.0.1:8000/api';

export const calculateRoute = async (routeData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/calculate-route/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(routeData),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
};

export const healthCheck = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/health/`);
        return await response.json();
    } catch (error) {
        console.error('Health check failed:', error);
        throw error;
    }
};
