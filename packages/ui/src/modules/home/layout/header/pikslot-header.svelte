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

	const pageTitle = $derived(
		$page.url.pathname.split('/').filter(Boolean).pop()?.replace(/-/g, ' ') ?? 'Home'
	);

	const actions = [
		{ label: 'New booking', icon: CalendarPlus, href: '/home/bookings/new' },
		{ label: 'Add team member', icon: UsersPlus, href: '/home/settings/team/invite' },
		{ label: 'Create service', icon: Briefcase, href: '/home/services/new' },
		{ label: 'Add customer', icon: UserPlus, href: '/home/customers/new' },
		{ label: 'Create class', icon: School, href: '/home/services/classes/new' }
	];
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
							class="size-10 rounded-full focus-visible:ring-0 focus-visible:ring-offset-0 hover:bg-primary/80"
							{...props}
						>
							<Plus size={16} class="size-4" />
						</Button>
					{/snippet}
				</DropdownMenu.Trigger>
				<DropdownMenu.Content align="end" class="w-48">
					{#each actions as action}
						<DropdownMenu.Item class="cursor-pointer gap-2.5" onclick={() => goto(action.href)}>
							<action.icon size={15} class="text-muted-foreground" />
							{action.label}
						</DropdownMenu.Item>
					{/each}
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</div>
	</div>
</header>
