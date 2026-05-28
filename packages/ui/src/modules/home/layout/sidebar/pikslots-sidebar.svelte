<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import type { ComponentProps } from 'svelte';
	import { createQuery } from '@tanstack/svelte-query';
	import { getAllBusinessesQueryOptions } from '../../../api/business/get.all.businesses.query';
	import { navPrimary, navSecondary } from '../../nav-menu/menu';
	import NavPrimary from './nav-primary.svelte';
	import NavSecondary from './nav-secondary.svelte';
	import NavUser from './nav-user.svelte';
	import BusinessSwitcher from './business-switcher/business-switcher.svelte';

	const businessesQuery = createQuery(() => getAllBusinessesQueryOptions());

	let { ...restProps }: ComponentProps<typeof Sidebar.Root> = $props();
</script>

<Sidebar.Root collapsible="offcanvas" {...restProps}>
	<Sidebar.Header>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton class="data-[slot=sidebar-menu-button]:!p-1.5">
					{#snippet child({ props })}
						<a href="/home" class="font-code flex items-center gap-2 px-2 text-xl"> Pikslots </a>
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
		<NavPrimary items={navPrimary} />
		<NavSecondary items={navSecondary} class="mt-auto" />
	</Sidebar.Content>
	<Sidebar.Footer>
		<NavUser />
	</Sidebar.Footer>
</Sidebar.Root>
