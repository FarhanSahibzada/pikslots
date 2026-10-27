import type { Icon } from '@tabler/icons-svelte';
import type { ResolvedPathname } from '$app/types';
import type { UserRole } from '@pikslots/shared';
import { resolve } from '$app/paths';

import Home from '@tabler/icons-svelte/icons/home';
import CalendarCheck from '@tabler/icons-svelte/icons/calendar-check';
import Briefcase from '@tabler/icons-svelte/icons/briefcase';
import UserHeart from '@tabler/icons-svelte/icons/user-heart';
import Cash from '@tabler/icons-svelte/icons/cash';
import Puzzle from '@tabler/icons-svelte/icons/puzzle';
import BuildingStore from '@tabler/icons-svelte/icons/building-store';
import User from '@tabler/icons-svelte/icons/user';
import Users from '@tabler/icons-svelte/icons/users';
import AdjustmentsHorizontal from '@tabler/icons-svelte/icons/adjustments-horizontal';
import CalendarCog from '@tabler/icons-svelte/icons/calendar-cog';
import Bell from '@tabler/icons-svelte/icons/bell';
import Palette from '@tabler/icons-svelte/icons/palette';
import Phone from '@tabler/icons-svelte/icons/phone';
import MapPin from '@tabler/icons-svelte/icons/map-pin';
import Clock from '@tabler/icons-svelte/icons/clock';
import Link from '@tabler/icons-svelte/icons/link';
import Eye from '@tabler/icons-svelte/icons/eye';

export const privilegedRoles: UserRole[] = ['Platform Owner', 'Business Owner', 'Admin'];
export const customerAccess: UserRole[] = ['Platform Owner', 'Business Owner', 'Admin', 'Enhanced'];

export type SearchPage = {
	label: string;
	url: ResolvedPathname;
	icon: Icon;
	group: 'Pages' | 'Settings';
	keywords: string[];
	roles?: UserRole[];
};

export const searchPages: SearchPage[] = [
	{
		label: 'Home',
		url: resolve('/home'),
		icon: Home,
		group: 'Pages',
		keywords: ['dashboard', 'overview']
	},
	{
		label: 'Notifications',
		url: resolve('/home/notifications'),
		icon: Bell,
		group: 'Pages',
		keywords: ['alerts', 'inbox', 'updates']
	},
	{
		label: 'Bookings',
		url: resolve('/home/bookings'),
		icon: CalendarCheck,
		group: 'Pages',
		keywords: ['appointments', 'schedule', 'calendar']
	},
	{
		label: 'Services',
		url: resolve('/home/services'),
		icon: Briefcase,
		group: 'Pages',
		keywords: ['classes', 'offerings', 'treatments']
	},
	{
		label: 'Customers',
		url: resolve('/home/customers'),
		icon: UserHeart,
		group: 'Pages',
		keywords: ['clients', 'contacts'],
		roles: customerAccess
	},
	{
		label: 'Payments',
		url: resolve('/home/payments'),
		icon: Cash,
		group: 'Pages',
		keywords: ['transactions', 'revenue', 'billing'],
		roles: privilegedRoles
	},
	{
		label: 'Integrations',
		url: resolve('/home/integrations'),
		icon: Puzzle,
		group: 'Pages',
		keywords: ['apps', 'connections', 'plugins'],
		roles: privilegedRoles
	},
	{
		label: 'Your brand',
		url: resolve('/home/settings/your-brand'),
		icon: BuildingStore,
		group: 'Settings',
		keywords: ['business', 'brand', 'settings']
	},
	{
		label: 'Your profile',
		url: resolve('/home/settings/profile'),
		icon: User,
		group: 'Settings',
		keywords: ['account', 'personal', 'settings']
	},
	{
		label: 'Your team',
		url: resolve('/home/settings/team'),
		icon: Users,
		group: 'Settings',
		keywords: ['staff', 'members', 'employees', 'settings'],
		roles: privilegedRoles
	},
	{
		label: 'General',
		url: resolve('/home/settings/general'),
		icon: AdjustmentsHorizontal,
		group: 'Settings',
		keywords: ['preferences', 'settings'],
		roles: privilegedRoles
	},
	{
		label: 'Brand details',
		url: resolve('/home/settings/brand/brand-details'),
		icon: BuildingStore,
		group: 'Settings',
		keywords: ['business', 'name', 'brand', 'settings'],
		roles: privilegedRoles
	},
	{
		label: 'Appearance',
		url: resolve('/home/settings/brand/appearance'),
		icon: Palette,
		group: 'Settings',
		keywords: ['theme', 'colors', 'brand', 'settings'],
		roles: privilegedRoles
	},
	{
		label: 'Contact details',
		url: resolve('/home/settings/brand/contact'),
		icon: Phone,
		group: 'Settings',
		keywords: ['phone', 'email', 'brand', 'settings'],
		roles: privilegedRoles
	},
	{
		label: 'Location',
		url: resolve('/home/settings/brand/location'),
		icon: MapPin,
		group: 'Settings',
		keywords: ['address', 'map', 'brand', 'settings'],
		roles: privilegedRoles
	},
	{
		label: 'Business Hours',
		url: resolve('/home/settings/brand/business-hours'),
		icon: Clock,
		group: 'Settings',
		keywords: ['opening', 'closing', 'schedule', 'brand', 'settings'],
		roles: privilegedRoles
	},
	{
		label: 'Your links',
		url: resolve('/home/settings/brand/links'),
		icon: Link,
		group: 'Settings',
		keywords: ['url', 'website', 'social', 'brand', 'settings'],
		roles: privilegedRoles
	},
	{
		label: 'Booking policies',
		url: resolve('/home/settings/booking-preferences/booking-policies'),
		icon: CalendarCog,
		group: 'Settings',
		keywords: ['cancellation', 'rules', 'settings'],
		roles: privilegedRoles
	},
	{
		label: 'Booking setup',
		url: resolve('/home/settings/booking-preferences/booking-setup'),
		icon: CalendarCheck,
		group: 'Settings',
		keywords: ['availability', 'booking', 'settings'],
		roles: privilegedRoles
	},
	{
		label: 'Customization',
		url: resolve('/home/settings/booking-preferences/customization'),
		icon: Palette,
		group: 'Settings',
		keywords: ['booking', 'page', 'settings'],
		roles: privilegedRoles
	},
	{
		label: 'Booking page visibility',
		url: resolve('/home/settings/booking-preferences/booking-page-visibility'),
		icon: Eye,
		group: 'Settings',
		keywords: ['public', 'hidden', 'booking', 'settings'],
		roles: privilegedRoles
	},
	{
		label: 'Your notifications',
		url: resolve('/home/settings/notifications/your-notifications'),
		icon: Bell,
		group: 'Settings',
		keywords: ['alerts', 'email', 'settings']
	},
	{
		label: 'Team notifications',
		url: resolve('/home/settings/notifications/team-notifications'),
		icon: Users,
		group: 'Settings',
		keywords: ['alerts', 'staff', 'settings'],
		roles: privilegedRoles
	},
	{
		label: 'Customer notifications',
		url: resolve('/home/settings/notifications/customer-notifications'),
		icon: UserHeart,
		group: 'Settings',
		keywords: ['alerts', 'clients', 'settings'],
		roles: privilegedRoles
	},
	{
		label: 'Notification customization',
		url: resolve('/home/settings/notifications/customization'),
		icon: Palette,
		group: 'Settings',
		keywords: ['alerts', 'templates', 'settings'],
		roles: privilegedRoles
	}
];

export function getSearchPages(role: UserRole | undefined): SearchPage[] {
	if (!role) return [];
	return searchPages.filter((page) => !page.roles || page.roles.includes(role));
}
