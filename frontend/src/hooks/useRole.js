import { useAuth } from './useAuth';
import { ROLES } from '../constants/roles';

export const useRole = () => {
  const { user } = useAuth();

  return {
    isAdmin: () => user?.role === ROLES.ADMIN,
    isPM: () => user?.role === ROLES.PROJECT_MANAGER,
    isDev: () => user?.role === ROLES.DEVELOPER,
    isQA: () => user?.role === ROLES.QA,
  };
};
