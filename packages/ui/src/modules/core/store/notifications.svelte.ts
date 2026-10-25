import { createDummyNotifications, type NotificationItem } from '../../notifications/data';

function createNotificationsStore() {
	let notifications = $state<NotificationItem[]>(createDummyNotifications());

	function markAllAsRead() {
		notifications = notifications.map((notification) => ({ ...notification, read: true }));
	}

	function markAsRead(id: string) {
		const target = notifications.find((notification) => notification.id === id);
		if (!target || target.read) return;

		notifications = notifications.map((notification) =>
			notification.id === id ? { ...notification, read: true } : notification
		);
	}

	return {
		get notifications() {
			return notifications;
		},
		get unreadCount(): number {
			return notifications.filter((notification) => !notification.read).length;
		},
		markAllAsRead,
		markAsRead
	};
}

export const notificationsStore = createNotificationsStore();
