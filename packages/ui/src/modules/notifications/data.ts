import type { Icon } from '@tabler/icons-svelte';
import type { ResolvedPathname } from '$app/types';
import { resolve } from '$app/paths';

import CalendarCheck from '@tabler/icons-svelte/icons/calendar-check';
import Users from '@tabler/icons-svelte/icons/users';
import Cash from '@tabler/icons-svelte/icons/cash';
import Bell from '@tabler/icons-svelte/icons/bell';

export type NotificationKind = 'booking' | 'team' | 'payment' | 'system';

export type NotificationItem = {
	id: string;
	kind: NotificationKind;
	title: string;
	message: string;
	body: string[];
	createdAt: string;
	read: boolean;
	href?: ResolvedPathname;
};

export const notificationMeta: Record<
	NotificationKind,
	{ label: string; icon: Icon; className: string }
> = {
	booking: {
		label: 'Booking',
		icon: CalendarCheck,
		className: 'bg-teal-500/10 text-teal-600 dark:text-teal-400'
	},
	team: {
		label: 'Team',
		icon: Users,
		className: 'bg-violet-500/10 text-violet-600 dark:text-violet-400'
	},
	payment: {
		label: 'Payment',
		icon: Cash,
		className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
	},
	system: {
		label: 'System',
		icon: Bell,
		className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
	}
};

export function formatRelativeTime(iso: string): string {
	const diffMs = Date.now() - new Date(iso).getTime();
	const minutes = Math.max(0, Math.round(diffMs / 60_000));
	if (minutes < 1) return 'Just now';
	if (minutes < 60) return `${minutes}m ago`;

	const hours = Math.round(minutes / 60);
	if (hours < 24) return `${hours}h ago`;

	const days = Math.round(hours / 24);
	if (days < 7) return `${days}d ago`;

	return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export function formatFullTime(iso: string): string {
	return new Date(iso).toLocaleString('en-GB', {
		dateStyle: 'medium',
		timeStyle: 'short'
	});
}

function minutesAgo(minutes: number): string {
	return new Date(Date.now() - minutes * 60_000).toISOString();
}

export function createDummyNotifications(): NotificationItem[] {
	return [
		{
			id: 'notification-1',
			kind: 'booking',
			title: 'New booking confirmed',
			message: 'Ava Thompson booked a 60 min massage for tomorrow at 10:00.',
			body: [
				'Ava Thompson has booked a 60 minute massage for tomorrow at 10:00. The appointment has been assigned to you and is now visible on your calendar.',
				'Please arrive at least 10 minutes early to prepare the room. If you need to make any changes, you can manage the appointment from the booking details page.'
			],
			createdAt: minutesAgo(5),
			read: false,
			href: resolve('/home/bookings')
		},
		{
			id: 'notification-2',
			kind: 'team',
			title: 'Jordan joined your team',
			message: 'Jordan Lee accepted the invitation to join your business.',
			body: [
				'Jordan Lee accepted your invitation and now has access to your business as a team member.',
				'You can manage Jordan’s assigned services, working hours and permissions from the team settings page.'
			],
			createdAt: minutesAgo(38),
			read: false,
			href: resolve('/home/settings/team')
		},
		{
			id: 'notification-3',
			kind: 'payment',
			title: 'Payment received',
			message: 'A payment of $120.00 was received for a completed booking.',
			body: [
				'A payment of $120.00 has been received for a completed booking. The payment was processed successfully and no further action is required.',
				'You can review the transaction and download a record of the payment from your payments history.'
			],
			createdAt: minutesAgo(120),
			read: false,
			href: resolve('/home/payments')
		},
		{
			id: 'notification-4',
			kind: 'booking',
			title: 'Booking rescheduled',
			message: 'Noah Williams moved his appointment from 14:00 to 16:30.',
			body: [
				'Noah Williams moved his appointment from 14:00 to 16:30. The booking calendar and the customer’s confirmation have been updated automatically.',
				'If the new time no longer works for you, contact the customer or update the booking from the bookings page.'
			],
			createdAt: minutesAgo(60 * 20),
			read: true,
			href: resolve('/home/bookings')
		},
		{
			id: 'notification-5',
			kind: 'system',
			title: 'Weekly summary is ready',
			message: 'Your business summary for last week is available to review.',
			body: [
				'Your weekly summary is ready. It includes an overview of your bookings, revenue, new customers and team utilisation for the previous week.',
				'Use the summary to spot trends and plan ahead for the coming week.'
			],
			createdAt: minutesAgo(60 * 24),
			read: true,
			href: resolve('/home/settings/reports')
		},
		{
			id: 'notification-6',
			kind: 'team',
			title: 'Time off approved',
			message: 'Your time off request for Friday has been approved.',
			body: [
				'Your time off request for Friday has been approved. Your availability has been updated and your bookings for that period have been adjusted.',
				'You can review your updated working hours and time off from your profile settings.'
			],
			createdAt: minutesAgo(60 * 24 * 2),
			read: true,
			href: resolve('/home/settings/profile')
		},
		{
			id: 'notification-7',
			kind: 'booking',
			title: 'Booking cancelled',
			message: 'Sofia Martinez cancelled her appointment scheduled for Saturday.',
			body: [
				'Sofia Martinez cancelled her appointment scheduled for Saturday. The time slot has been released and is now available again.',
				'You can review the cancellation and the updated calendar on the bookings page.'
			],
			createdAt: minutesAgo(60 * 24 * 4),
			read: true,
			href: resolve('/home/bookings')
		},
		{
			id: 'notification-8',
			kind: 'system',
			title: 'Welcome to Pikslots',
			message: 'Your account is ready. Finish setting up your business to get started.',
			body: [
				'Your Pikslots account is ready. You can now start setting up your business and preparing to take bookings.',
				'Complete your brand details, booking preferences and notification settings to make the most of your workspace.'
			],
			createdAt: minutesAgo(60 * 24 * 6),
			read: true,
			href: resolve('/home')
		}
	];
}
