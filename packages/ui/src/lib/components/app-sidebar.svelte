<script lang="ts">
	import HelpIcon from '@tabler/icons-svelte/icons/help';
	import SearchIcon from '@tabler/icons-svelte/icons/search';
	import SettingsIcon from '@tabler/icons-svelte/icons/settings';
	import NavSecondary from './nav-secondary.svelte';
	import NavUser from './nav-user.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import type { ComponentProps } from 'svelte';
	import BusinessSwitcher from './business-switcher.svelte';
	import { createQuery } from '@tanstack/svelte-query';
	import { getAllBusinessesQueryOptions } from '../../api/business/get.all.businesses.query.js';
	import NavMenuPrimary from './nav-menu-primary.svelte';
	import Calendar from '@tabler/icons-svelte/icons/calendar';
	import Briefcase from '@tabler/icons-svelte/icons/briefcase';
	import UserHeart from '@tabler/icons-svelte/icons/user-heart';
	import Cash from '@tabler/icons-svelte/icons/cash';
	import Puzzle from '@tabler/icons-svelte/icons/puzzle';
	import { IconCalendarCheck } from '@tabler/icons-svelte';

	const data = {
		user: {
			name: 'shadcn',
			email: 'm@example.com',
			avatar: '/avatars/shadcn.jpg'
		},
		primaryMenu: [
			{
				name: 'Bookings',
				url: '/home/bookings',
				icon: IconCalendarCheck
			},
			{
				name: 'Services',
				url: '/home/services',
				icon: Briefcase
			},
			{
				name: 'Customers',
				url: '/home/customers',
				icon: UserHeart
			},
			{
				name: 'Payments',
				url: '/home/payments',
				icon: Cash
			},
			{
				name: 'Integrations',
				url: '/home/integrations',
				icon: Puzzle
			}
		],
		navSecondary: [
			{
				title: 'Settings',
				url: '#',
				icon: SettingsIcon
			},
			{
				title: 'Get Help',
				url: '#',
				icon: HelpIcon
			},
			{
				title: 'Search',
				url: '#',
				icon: SearchIcon
			}
		]
	};

	const businessesQuery = createQuery(() => getAllBusinessesQueryOptions());

	let { ...restProps }: ComponentProps<typeof Sidebar.Root> = $props();
</script>

<Sidebar.Root collapsible="offcanvas" {...restProps}>
	<Sidebar.Header>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton class="data-[slot=sidebar-menu-button]:!p-1.5">
					{#snippet child({ props })}
						<a href="##" class="font-code flex items-center gap-2 px-2 text-xl"> Pikslots </a>
					{/snippet}
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
		{#if businessesQuery?.data !== undefined}
			<BusinessSwitcher businesses={businessesQuery.data} />
		{/if}
	</Sidebar.Header>
	<Sidebar.Content>
		<!-- <NavMain items={data.navMain} /> -->
		<NavMenuPrimary items={data.primaryMenu} />
		<NavSecondary items={data.navSecondary} class="mt-auto" />
	</Sidebar.Content>
	<Sidebar.Footer>
		<NavUser user={data.user} />
	</Sidebar.Footer>
</Sidebar.Root>
