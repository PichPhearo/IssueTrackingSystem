import client from './client';

export const getNotifications = () => client.get('/notifications');

export const markNotificationAsRead = (id) => client.patch(`/notifications/${id}/read`);

export const markAllNotificationsAsRead = () => client.patch('/notifications/read-all');
