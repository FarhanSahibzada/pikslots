<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import Search from '@tabler/icons-svelte/icons/search';
	import { createMutation, createQuery, useQueryClient } from '@tanstack/svelte-query';
	import { SvelteSet } from 'svelte/reactivity';
	import { toast } from 'svelte-sonner';
	import { getServicesByUserQueryOptions } from '../../../api/service-user-assignment/get.services.by.user.query';
	import { getServicesByBusinessQueryOptions } from '../../../api/service/get.services.by.business.query';
	import { assignServiceMutationOptions } from '../../../api/service-user-assignment/assign.service.mutation';
	import { removeServiceMutationOptions } from '../../../api/service-user-assignment/remove.service.mutation';
	import { authStore } from '$stores/auth.svelte';
	import { businessStore } from '$stores/business.svelte';
	import { formatCost } from '../../../services/utils/service-format';

	const userId = $derived(authStore.getPayloadData()?.userId ?? '');
	const businessId = $derived(businessStore.selectedBusiness?.id ?? '');
	const business = $derived(businessStore.selectedBusiness ?? null);

	const queryClient = useQueryClient();

	const userServicesQuery = createQuery(() => getServicesByUserQueryOptions(userId));
	const allServicesQuery = createQuery(() => getServicesByBusinessQueryOptions(businessId));

	const assignMut = createMutation(() => assignServiceMutationOptions());
	const removeMut = createMutation(() => removeServiceMutationOptions());

	let dialogOpen = $state(false);
	let dialogSearch = $state('');

	let selectedIds = $state(new Set<string>());

	function formatDuration(mins: number): string {
		if (mins < 60) return `${mins} mins`;
		const h = Math.floor(mins / 60);
		const m = mins % 60;
		return m > 0 ? `${h} hr ${m} mins` : `${h} hr`;
	}

	function openDialog() {
		selectedIds = new Set((userServicesQuery.data ?? []).map((s) => s.id));
		dialogSearch = '';
		dialogOpen = true;
	}

	const filteredServices = $derived(
		(allServicesQuery.data ?? []).filter((s) =>
			s.title.toLowerCase().includes(dialogSearch.toLowerCase())
		)
	);

	const allSelected = $derived(
		filteredServices.length > 0 && filteredServices.every((s) => selectedIds.has(s.id))
	);

	function toggleSelectAll() {
		if (allSelected) {
			const next = new SvelteSet(selectedIds);
			filteredServices.forEach((s) => next.delete(s.id));
			selectedIds = next;
		} else {
			const next = new SvelteSet(selectedIds);
			filteredServices.forEach((s) => next.add(s.id));
			selectedIds = next;
		}
	}

	function toggleService(id: string) {
		const next = new SvelteSet(selectedIds);
		if (next.has(id)) {
			next.delete(id);
		} else {
			next.add(id);
		}
		selectedIds = next;
	}

	const isPending = $derived(assignMut.isPending || removeMut.isPending);

	async function handleUpdate() {
		const current = new Set((userServicesQuery.data ?? []).map((s) => s.id));
		const all = allServicesQuery.data ?? [];

		const toAssign = all.filter((s) => selectedIds.has(s.id) && !current.has(s.id));
		const toRemove = all.filter((s) => !selectedIds.has(s.id) && current.has(s.id));

		try {
			await Promise.all([
				...toAssign.map((s) => assignMut.mutateAsync({ serviceId: s.id, userId, businessId })),
				...toRemove.map((s) => removeMut.mutateAsync({ serviceId: s.id, userId }))
			]);

			await queryClient.invalidateQueries({
				queryKey: ['service-user-assignments', 'by-user', userId]
			});

			toast.success('Services updated');
			dialogOpen = false;
		} catch {
			toast.error('Failed to update services');
		}
	}
</script>

<div class="flex flex-col px-6 pt-4">
	<Button variant="outline" size="sm" class="w-fit cursor-pointer" onclick={openDialog}>
		Manage services
	</Button>

	<div class="mt-4 flex flex-col">
		{#if userServicesQuery.isPending}
			<p class="py-3 text-xs text-muted-foreground">Loading...</p>
		{:else if (userServicesQuery.data ?? []).length === 0}
			<p class="py-3 text-xs text-muted-foreground">No services configured.</p>
		{:else}
			{#each userServicesQuery.data ?? [] as service (service.id)}
				<div
					class="flex items-center gap-4 border-b border-l-4 px-5 py-3.5 hover:bg-accent/40"
					style:border-left-color={service.colorCode}
				>
					<div class="flex flex-1 flex-col">
						<span class="text-sm font-medium">{service.title}</span>
						<span class="text-xs text-muted-foreground">
							{formatDuration(service.durationInMins)} · {formatCost(
								service.cost / 100,
								business?.locationDetails?.currency ?? ''
							)}
						</span>
					</div>
				</div>
			{/each}
		{/if}
	</div>
</div>

<Dialog.Root bind:open={dialogOpen}>
	<Dialog.Content class="max-w-sm">
		<Dialog.Header>
			<Dialog.Title>Services</Dialog.Title>
		</Dialog.Header>

		<div class="flex flex-col gap-3">
			<div class="relative">
				<Search
					size={14}
					class="absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground"
				/>
				<Input bind:value={dialogSearch} placeholder="Search" class="pl-8 text-xs" />
			</div>

			<div class="flex items-center justify-between">
				<div class="flex items-center gap-2">
					<Checkbox checked={allSelected} onCheckedChange={toggleSelectAll} id="select-all" />
					<label for="select-all" class="cursor-pointer text-sm font-medium">Select all</label>
				</div>
				<span class="text-xs text-muted-foreground">
					{selectedIds.size}/{allServicesQuery.data?.length ?? 0}
				</span>
			</div>

			<div class="flex max-h-72 flex-col gap-2 overflow-y-auto">
				{#if allServicesQuery.isPending}
					<p class="text-xs text-muted-foreground">Loading...</p>
				{:else}
					{#each filteredServices as service (service.id)}
						<div
							class="flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5"
							style="border-left: 3px solid {service.colorCode || '#e5e7eb'}"
							role="button"
							tabindex="0"
							onclick={() => toggleService(service.id)}
							onkeydown={(e) => e.key === 'Enter' && toggleService(service.id)}
						>
							<Checkbox checked={selectedIds.has(service.id)} />
							<div class="flex flex-col">
								<span class="text-sm font-medium">{service.title}</span>
								<span class="text-xs text-muted-foreground">
									{formatDuration(service.durationInMins)} · {formatCost(
										service.cost / 100,
										business?.locationDetails?.currency ?? ''
									)}
								</span>
							</div>
						</div>
					{/each}
				{/if}
			</div>
		</div>

		<Dialog.Footer>
			<Button variant="ghost" onclick={() => (dialogOpen = false)}>Cancel</Button>
			<Button onclick={handleUpdate} disabled={isPending}>
				{isPending ? 'Updating...' : 'Update'}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
