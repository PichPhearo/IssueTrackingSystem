import client from './client';

let projectsCache = null;
let projectsPromise = null;

export const getProjects = (params, forceRefresh = false) => {
  const hasParams = params && Object.keys(params).length > 0;
  if (!hasParams && !forceRefresh && projectsCache) {
    return Promise.resolve({ data: { data: projectsCache } });
  }
  if (!hasParams && projectsPromise) {
    return projectsPromise;
  }
  const req = client.get('/projects', { params });
  if (!hasParams) {
    projectsPromise = req
      .then((res) => {
        projectsCache = res.data?.data || res.data || [];
        return res;
      })
      .finally(() => {
        projectsPromise = null;
      });
    return projectsPromise;
  }
  return req;
};

export const clearProjectsCache = () => {
  projectsCache = null;
};

export const getProject = (id) => client.get(`/projects/${id}`);
export const createProject = async (data) => {
  const res = await client.post('/projects', data);
  clearProjectsCache();
  return res;
};
export const updateProject = async (id, data) => {
  const res = await client.put(`/projects/${id}`, data);
  clearProjectsCache();
  return res;
};
export const deleteProject = async (id) => {
  const res = await client.delete(`/projects/${id}`);
  clearProjectsCache();
  return res;
};

export const addMember = (projectId, userId) => client.post(`/projects/${projectId}/members`, { user_id: userId });
export const removeMember = (projectId, userId) => client.delete(`/projects/${projectId}/members/${userId}`, { data: { user_id: userId } });
