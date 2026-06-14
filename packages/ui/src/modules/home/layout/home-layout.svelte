<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import SettingsSidebar from '$lib/components/settings-sidebar.svelte';
	import { settingsStore } from '$stores/settings.svelte.js';
	import { authStore } from '$stores/auth.svelte.js';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import PikslotHeader from './header/pikslot-header.svelte';
	import PikslotsSidebar from './sidebar/pikslots-sidebar.svelte';
	import { getBusinessByIdQueryOptions } from '../../api/business/get.business.by.id.query';
	import { createQuery } from '@tanstack/svelte-query';
	import { businessStore } from '$stores/business.svelte';

	let { children } = $props();
	let callGetBusinessById = $state<boolean>(false);
	const businessFindByIdQuery = createQuery(() =>
		getBusinessByIdQueryOptions(callGetBusinessById, authStore.getPayloadData()?.businessId ?? '')
	);

	$effect(() => {
		if (!authStore.isInitializing && !authStore.isAuthenticated) goto('/login');

		if (
			authStore.getPayloadData()?.role !== 'Platform Owner' ||
			authStore.getPayloadData()?.role === 'No Access'
		)
			callGetBusinessById = true;

		if (businessFindByIdQuery.data) businessStore.setSelectedBusiness(businessFindByIdQuery.data);
	});

	$effect(() => {
		if ($page.url.pathname.startsWith('/home/settings')) {
			settingsStore.makeOpen();
		}
	});
</script>

{#if !authStore.isInitializing && authStore.isAuthenticated}
	<Sidebar.Provider
		style="
		--sidebar-width: calc(var(--spacing) * 64); /* 72 * 0.25rem = 18rem (288px), change multiplier to resize: 64=16rem, 80=20rem, 96=24rem */
		--header-height: calc(var(--spacing) * 12); /* 12 * 0.25rem = 3rem (48px) */
	"
	>
		<PikslotsSidebar variant="inset" />
		{#if settingsStore.open}
			<SettingsSidebar />
		{/if}
		<Sidebar.Inset>
			<PikslotHeader />
			<div class="flex flex-1 flex-col">
				<div class="@container/main flex flex-1 flex-col gap-2">
					<div class="flex flex-col gap-4 px-2 py-4 md:gap-6 md:py-6">
						{@render children()}
					</div>
				</div>
			</div>
		</Sidebar.Inset>
	</Sidebar.Provider>
{/if}
