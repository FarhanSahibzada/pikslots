<script lang="ts">
	import { Separator } from '$lib/components/ui/separator/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import Plus from '@tabler/icons-svelte/icons/plus';
	import CalendarPlus from '@tabler/icons-svelte/icons/calendar-plus';
	import UsersPlus from '@tabler/icons-svelte/icons/users-plus';
	import Briefcase from '@tabler/icons-svelte/icons/briefcase';
	import UserPlus from '@tabler/icons-svelte/icons/user-plus';
	import School from '@tabler/icons-svelte/icons/school';
	import type { UserRole } from '@pikslots/shared';
	import { authStore } from '$stores/auth.svelte';

	const pageTitle = $derived.by(() => {
		const segments = $page.url.pathname.split('/').filter(Boolean);
		if (segments[1] === 'notifications' && segments.length > 2) return 'Notification';
		return segments.pop()?.replace(/-/g, ' ') ?? 'Home';
	});

	const privilegedRoles: UserRole[] = ['Platform Owner', 'Business Owner', 'Admin'];
	const currentUserRole = $derived(authStore.getPayloadData());

	const actions = [
		{ label: 'New booking', icon: CalendarPlus, href: '/home/bookings?create=true' },
		{
			label: 'Add team member',
			icon: UsersPlus,
			href: '/home/settings/team?invite=true',
			roles: privilegedRoles
		},
		{
			label: 'Create service',
			icon: Briefcase,
			href: '/home/services/new',
			roles: privilegedRoles
		},
		{
			label: 'Add customer',
			icon: UserPlus,
			href: '/home/customers?add=true',
			roles: privilegedRoles
		},
		{
			label: 'Create class',
			icon: School,
			href: '/home/services/classes/new',
			roles: privilegedRoles
		}
	];

	function isItemAllowed(roles: UserRole[] | null): boolean {
		if (!currentUserRole) return false;
		if (!roles) return true;
		return roles.includes(currentUserRole.role);
	}

	const mainOptions = $derived(actions.filter((item) => isItemAllowed(item?.roles ?? null)));
</script>

<header
	class="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)"
>
	<div class="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
		<Sidebar.Trigger class="-ms-1" />
		<Separator orientation="vertical" class="mx-2 data-[orientation=vertical]:h-4" />
		<h1 class="text-base font-medium capitalize">{pageTitle}</h1>

		<div class="ml-auto">
			<DropdownMenu.Root>
				<DropdownMenu.Trigger>
					{#snippet child({ props })}
						<Button
							class="size-10 rounded-full hover:bg-primary/80 focus-visible:ring-0 focus-visible:ring-offset-0"
							{...props}
						>
							<Plus size={16} class="size-4" />
						</Button>
					{/snippet}
				</DropdownMenu.Trigger>
				<DropdownMenu.Content align="end" class="w-48">
					<!-- eslint-disable svelte/no-navigation-without-resolve -- some of these action routes (bookings/new, settings/team/invite, customers/new) aren't built yet, so resolve() can't type-check them -->
					{#each mainOptions as action (action.href)}
						<DropdownMenu.Item class="cursor-pointer gap-2.5" onclick={() => goto(action.href)}>
							<action.icon size={15} class="text-muted-foreground" />
							{action.label}
						</DropdownMenu.Item>
					{/each}
					<!-- eslint-enable svelte/no-navigation-without-resolve -->
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</div>
	</div>
</header>
