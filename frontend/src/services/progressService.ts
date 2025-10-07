import api from './api';

export const fetchProgress = async (token: string) => {
  const res = await api.get('api/progress/', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const createProgress = async (token: string,payload: any) => {
  const res = await api.post('api/progress/', payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
