/**
 * Groups a list of user objects by their role into ordered categories for UI dropdowns.
 *
 * @param {Array<{id: number, name: string, role: string}>} users
 * @returns {Array<{key: string, label: string, users: Array<object>}>}
 */
export const groupUsersByRole = (users = []) => {
  const groups = [
    { key: 'developer', label: 'Developers (Can resolve tasks)', users: [] },
    { key: 'qa', label: 'QA / Testers (Can verify & close)', users: [] },
    { key: 'project_manager', label: 'Project Managers', users: [] },
    { key: 'admin', label: 'Administrators', users: [] },
  ];

  const map = new Map(groups.map((g) => [g.key, g]));
  const other = { key: 'other', label: 'Other Users', users: [] };

  users.forEach((user) => {
    const group = map.get(user.role);
    if (group) {
      group.users.push(user);
    } else {
      other.users.push(user);
    }
  });

  const result = groups.filter((g) => g.users.length > 0);
  if (other.users.length > 0) {
    result.push(other);
  }
  return result;
};
