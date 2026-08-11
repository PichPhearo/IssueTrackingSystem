import client from './client';

export const login = (credentials) => client.post('/login', credentials);
export const register = (data) => client.post('/register', data);
export const logout = () => client.post('/logout');
export const me = () => client.get('/me');
