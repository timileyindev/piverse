import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
});

export const fetchFeed = async () => {
  const { data } = await api.get('/feed');
  return data;
};

export const fetchStats = async () => {
  const { data } = await api.get('/stats');
  return data;
};

export const fetchMarketStats = async () => {
  const { data } = await api.get('/market');
  return data;
};

export const fetchUserPredictions = async (walletAddress) => {
  const { data } = await api.get(`/predictions/${walletAddress}`);
  return data;
};

export const placePrediction = async ({ walletAddress, type, amount, txSignature }) => {
    const { data } = await api.post('/predict', { walletAddress, type, amount, txSignature });
    return data;
};

export const sendChatMessage = async ({ walletAddress, message, txSignature }) => {
    const { data } = await api.post('/chat', { walletAddress, message, txSignature });
    return data;
};

export const fetchConfig = async () => {
    const { data } = await api.get('/config');
    return data;
};
