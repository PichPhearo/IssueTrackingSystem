import client from './client';

let usersCache = null;
let usersPromise = null;

export const getUsers = (forceRefresh = false) => {
  if (!forceRefresh && usersCache) {
    return Promise.resolve({ data: { data: usersCache } });
  }
  if (usersPromise) {
    return usersPromise;
  }
  usersPromise = client
    .get('/users')
    .then((res) => {
      usersCache = res.data?.data || res.data || [];
      return res;
    })
    .finally(() => {
      usersPromise = null;
    });
  return usersPromise;
};

export const clearUsersCache = () => {
  usersCache = null;
};

export const getUser = (id) => client.get(`/users/${id}`);

export const updateRole = async (userId, role) => {
  const res = await client.patch(`/users/${userId}/role`, { role });
  clearUsersCache();
  return res;
};

export const toggleActive = async (userId) => {
  const res = await client.patch(`/users/${userId}/toggle-active`);
  clearUsersCache();
  return res;
};
