
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
  AUTH: {
    ME: `${API_BASE_URL}/api/v1/auth/me`,
    LOGIN: `${API_BASE_URL}/api/v1/auth/login`,
    SIGNUP: `${API_BASE_URL}/api/v1/auth/signup`,
  },
  AI: {
    CHAT: `${API_BASE_URL}/api/v1/ai/chat`,
    DOCUMENTS: `${API_BASE_URL}/api/v1/ai/documents`,
    UPLOAD: `${API_BASE_URL}/api/v1/ai/upload`,
    STATS: `${API_BASE_URL}/api/v1/ai/stats`,
    ANALYZE_RESUME: `${API_BASE_URL}/api/v1/ai/analyze-resume`,
    GENERATE_QUIZ: `${API_BASE_URL}/api/v1/ai/generate-quiz`,
  },
};
