import axios from 'axios';

// Change this URL when deploying backend to Render
const API_BASE_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getWords = async (lang = 'fr', count = 25) => {
  try {
    const response = await api.get(`/words?lang=${lang}&count=${count}`);
    return response.data.words;
  } catch (error) {
    console.error('Error fetching words:', error);
    throw error;
  }
};

export default api;
