<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import * as Accordion from '$lib/components/ui/accordion/index.js';
	import Plus from '@tabler/icons-svelte/icons/plus';
	import School from '@tabler/icons-svelte/icons/school';
	import Search from '@tabler/icons-svelte/icons/search';
	import Link from '@tabler/icons-svelte/icons/link';
	import Copy from '@tabler/icons-svelte/icons/copy';
	import DotsVertical from '@tabler/icons-svelte/icons/dots-vertical';
	import Adjustments from '@tabler/icons-svelte/icons/adjustments';
	import NewServiceGroupDialog from './dialog/new-service-group.svelte';
	import EditServiceGroupDialog from './dialog/edit-service-group.svelte';
	import type { ServiceGroupModel } from '../api/service-group/models/service-group-model';
	import ChevronDown from '@tabler/icons-svelte/icons/chevron-down';
	import ChevronUp from '@tabler/icons-svelte/icons/chevron-up';
	import { createQuery, createMutation, useQueryClient } from '@tanstack/svelte-query';
	import { getServiceGroupsByBusinessQueryOptions } from '../api/service-group/get.service.groups.by.business.query';
	import { getServicesByBusinessQueryOptions } from '../api/service/get.services.by.business.query';
	import { getServicesByGroupQueryOptions } from '../api/service-group-assignment/get.services.by.group.query';
	import { getServicesByUserQueryOptions } from '../api/service-user-assignment/get.services.by.user.query';
	import { getUsersInsideBusinessQueryOptions } from '../api/user/get.users.inside.business.query';
	import { deleteServiceGroupMutationOptions } from '../api/service-group/delete.service.group.mutation';
	import { deleteServiceMutationOptions } from '../api/service/delete.service.mutation';
	import { ConfirmDialog } from '$lib/components/ui/confirm-dialog/index.js';
	import { toast } from 'svelte-sonner';
	import { businessStore } from '$stores/business.svelte';
	import { IconBriefcase } from '@tabler/icons-svelte';
	import { goto } from '$app/navigation';
	import Pencil from '@tabler/icons-svelte/icons/pencil';
	import Trash from '@tabler/icons-svelte/icons/trash';
	import ExternalLink from '@tabler/icons-svelte/icons/external-link';
	import Qrcode from '@tabler/icons-svelte/icons/qrcode';
	import Share from '@tabler/icons-svelte/icons/share';
	import EyeOff from '@tabler/icons-svelte/icons/eye-off';
	import { Switch } from '$lib/components/ui/switch/index.js';
	import PikslotEmpty from '$lib/components/pikslot-empty.svelte';
	import Briefcase from '@tabler/icons-svelte/icons/briefcase';
	import InfoCircle from '@tabler/icons-svelte/icons/info-circle';

	// ── State ───────────────────────────────────────────────────────────────────

	let search = $state('');
	let selectedGroupId = $state<string | null>(null);
	let selectedUserId = $state<string | null>(null);
	let newGroupDialogOpen = $state(false);
	let openAccordionItems = $state<string[]>(['services', 'classes']);
	let deleteGroupId = $state<string | null>(null);
	let deleteGroupName = $state<string>('');
	let deleteServiceId = $state<string | null>(null);
	let deleteServiceTitle = $state<string>('');
	let editGroupDialogOpen = $state(false);
	let editingGroup = $state<ServiceGroupModel | null>(null);

	function toggleAccordionItem(item: string) {
		if (openAccordionItems.includes(item)) {
			openAccordionItems = openAccordionItems.filter((i) => i !== item);
		} else {
			openAccordionItems = [...openAccordionItems, item];
		}
	}

	// ── Queries ──────────────────────────────────────────────────────────────────

	const serviceGroupsQuery = createQuery(() => ({
		...getServiceGroupsByBusinessQueryOptions(businessStore.selectedBusiness?.id ?? ''),
		enabled: !!businessStore.selectedBusiness?.id
	}));

	const servicesQuery = createQuery(() => ({
		...getServicesByBusinessQueryOptions(businessStore.selectedBusiness?.id ?? ''),
		enabled: !!businessStore.selectedBusiness?.id
	}));

	const serviceGroups = $derived(serviceGroupsQuery.data ?? []);
	const services = $derived(servicesQuery.data ?? []);

	const usersQuery = createQuery(() => ({
		...getUsersInsideBusinessQueryOptions(businessStore.selectedBusiness?.id ?? ''),
		enabled: !!businessStore.selectedBusiness?.id
	}));

	const servicesByGroupQuery = createQuery(() => getServicesByGroupQueryOptions(selectedGroupId));
	const servicesByUserQuery = createQuery(() => getServicesByUserQueryOptions(selectedUserId));

	const users = $derived(usersQuery.data ?? []);

	const queryClient = useQueryClient();

	const deleteServiceGroupMutation = createMutation(() => ({
		...deleteServiceGroupMutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['service-groups'] });
			if (selectedGroupId === deleteGroupId) selectedGroupId = null;
			deleteGroupId = null;
			toast.success(`"${deleteGroupName}" deleted`);
		},
		onError: (error) => {
			toast.error(error.response?.data?.message ?? 'Failed to delete service group');
		}
	}));

	const deleteServiceMutation = createMutation(() => ({
		...deleteServiceMutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['services'] });
			deleteServiceId = null;
			toast.success(`"${deleteServiceTitle}" deleted`);
		},
		onError: (error) => {
			toast.error(error.response?.data?.message ?? 'Failed to delete service');
		}
	}));

	const bookingUrl = 'solverse.pikslots.com/afaq';

	// ── Derived ─────────────────────────────────────────────────────────────────

	const visibleServices = $derived(() => {
		let result = services;
		if (selectedGroupId) {
			const groupServiceIds = new Set(servicesByGroupQuery.data?.map((s) => s.id) ?? []);
			result = result.filter((s) => groupServiceIds.has(s.id));
		}
		if (selectedUserId) {
			const userServiceIds = new Set(servicesByUserQuery.data?.map((s) => s.id) ?? []);
			result = result.filter((s) => userServiceIds.has(s.id));
		}
		return result;
	});

	const filteredServices = $derived(
		visibleServices().filter((s) => s.title.toLowerCase().includes(search.toLowerCase()))
	);

	// ── Helpers ─────────────────────────────────────────────────────────────────

	function formatDuration(mins: number): string {
		if (mins < 60) return `${mins} mins`;
		const h = Math.floor(mins / 60);
		const m = mins % 60;
		return m > 0 ? `${h} hr ${m} mins` : `${h} hr`;
	}

	function formatCost(cost: number): string {
		return cost === 0 ? 'Free' : `$${(cost / 100).toFixed(2)}`;
	}

	async function copyLink(serviceId: string) {
		await navigator.clipboard.writeText(`https://${bookingUrl}/service/${serviceId}`);
	}

	async function copyBookingUrl() {
		await navigator.clipboard.writeText(`https://${bookingUrl}`);
	}
</script>

<NewServiceGroupDialog bind:open={newGroupDialogOpen} {services} />
<EditServiceGroupDialog bind:open={editGroupDialogOpen} bind:group={editingGroup} {services} />

<ConfirmDialog
	open={!!deleteGroupId}
	title="Delete service group?"
	description={`"${deleteGroupName}" will be permanently deleted along with all its service assignments. This cannot be undone.`}
	loading={deleteServiceGroupMutation.isPending}
	onConfirm={() => deleteServiceGroupMutation.mutate(deleteGroupId!)}
	onCancel={() => (deleteGroupId = null)}
/>

<ConfirmDialog
	open={!!deleteServiceId}
	title="Delete service?"
	description={`"${deleteServiceTitle}" will be permanently deleted. This cannot be undone.`}
	loading={deleteServiceMutation.isPending}
	onConfirm={() => deleteServiceMutation.mutate(deleteServiceId!)}
	onCancel={() => (deleteServiceId = null)}
/>

{#if !servicesQuery.isPending && services.length === 0}
	<div class="flex h-full min-h-0 flex-1 items-center justify-center">
		<PikslotEmpty
			icon={Briefcase}
			title="No services yet — let's change that!"
			description="Add your first service so clients can start booking with you."
			buttonLabel="Add Service"
			onclick={() => goto('/home/services/new')}
		/>
	</div>
{:else}
	<div class="flex h-full min-h-0 flex-1">
		<!-- ── Left: service groups sidebar ──────────────────────────────────────── -->
		<div class="flex w-64 shrink-0 flex-col border-r">
			<div class="flex items-center justify-between border-b px-4 py-3">
				<span class="text-sm font-semibold">Groups</span>
			</div>

			<div class="flex flex-1 flex-col overflow-y-auto">
				<Accordion.Root type="multiple" bind:value={openAccordionItems}>
					<!-- Services -->
					<Accordion.Item value="services" class="">
						<div class="flex items-center justify-between px-3 py-2">
							<button
								type="button"
								onclick={() => (selectedGroupId = null)}
								class="text-sm font-medium">Services ({servicesQuery.data?.length})</button
							>
							<button
								type="button"
								onclick={() => toggleAccordionItem('services')}
								class="text-muted-foreground hover:text-foreground"
							>
								{#if openAccordionItems.includes('services')}
									<ChevronUp size={14} />
								{:else}
									<ChevronDown size={14} />
								{/if}
							</button>
						</div>
						<Accordion.Content class="p-0">
							{#each serviceGroups as group (group.id)}
								<div class="group/item relative flex items-center">
									<button
										type="button"
										onclick={() =>
											(selectedGroupId = selectedGroupId === group.id ? null : group.id)}
										class="flex flex-1 items-center py-1.5 pr-8 pl-6 text-left text-sm transition-colors hover:bg-accent
										{selectedGroupId === group.id ? 'bg-accent font-medium' : 'text-muted-foreground'}"
									>
										{group.name}
									</button>
									<div class="absolute right-1 opacity-0 group-hover/item:opacity-100">
										<DropdownMenu.Root>
											<DropdownMenu.Trigger>
												{#snippet child({ props })}
													<Button variant="ghost" size="icon-sm" {...props}>
														<DotsVertical size={13} />
													</Button>
												{/snippet}
											</DropdownMenu.Trigger>
											<DropdownMenu.Content align="end" class="w-36">
												<DropdownMenu.Item
													class="cursor-pointer"
													onclick={() => {
														editingGroup = group;
														editGroupDialogOpen = true;
													}}><Pencil /> Edit</DropdownMenu.Item
												>
												<DropdownMenu.Separator />
												<DropdownMenu.Item
													class="cursor-pointer text-destructive focus:text-destructive"
													onclick={() => {
														deleteGroupId = group.id;
														deleteGroupName = group.name;
													}}><Trash />Delete</DropdownMenu.Item
												>
											</DropdownMenu.Content>
										</DropdownMenu.Root>
									</div>
								</div>
							{/each}
							<button
								type="button"
								onclick={() => (newGroupDialogOpen = true)}
								class="flex w-full items-center gap-1.5 px-3 py-2 text-left text-xs text-muted-foreground hover:text-foreground"
							>
								<Plus size={13} />
								New service group
							</button>
						</Accordion.Content>
					</Accordion.Item>

					<!-- <Separator class="my-1" /> -->

					<!-- Classes -->
					<Accordion.Item value="classes" class="">
						<div class="flex items-center justify-between px-3 py-2">
							<span class="text-sm font-medium">Classes (0)</span>
							<button
								type="button"
								onclick={() => toggleAccordionItem('classes')}
								class="text-muted-foreground hover:text-foreground"
							>
								{#if openAccordionItems.includes('classes')}
									<ChevronUp size={14} />
								{:else}
									<ChevronDown size={14} />
								{/if}
							</button>
						</div>
						<Accordion.Content class="p-0">
							<p class="px-6 py-1.5 text-xs text-muted-foreground">No classes yet.</p>
						</Accordion.Content>
					</Accordion.Item>
				</Accordion.Root>
			</div>
		</div>

		<!-- ── Right: services list ───────────────────────────────────────────────── -->
		<div class="flex flex-1 flex-col overflow-hidden">
			<!-- Header -->
			<div class="flex items-center justify-between border-b px-5 py-3">
				<h2 class="text-base font-semibold">Services</h2>
				<DropdownMenu.Root>
					<DropdownMenu.Trigger>
						{#snippet child({ props })}
							<Button size="sm" class="gap-1.5" {...props}>
								<Plus size={15} />
								Add
							</Button>
						{/snippet}
					</DropdownMenu.Trigger>
					<DropdownMenu.Content align="end" class="w-36">
						<DropdownMenu.Item
							class="cursor-pointer gap-2"
							onclick={() => goto('/home/services/new')}
						>
							<IconBriefcase size={15} class="text-muted-foreground" />
							Service
						</DropdownMenu.Item>
						<DropdownMenu.Item class="cursor-pointer gap-2" onclick={() => {}}>
							<School size={15} class="text-muted-foreground" />
							Class
						</DropdownMenu.Item>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			</div>

			<!-- Toolbar -->
			<div class="flex items-center gap-3 border-b px-5 py-2.5">
				<!-- Staff filter dropdown -->
				<DropdownMenu.Root>
					<DropdownMenu.Trigger>
						{#snippet child({ props })}
							<Button variant="outline" size="sm" class="gap-2 text-xs" {...props}>
								<Avatar.Root class="size-5 text-[10px]">
									<Avatar.Fallback class="bg-primary text-[10px] text-primary-foreground">
										{#if selectedUserId}
											{@const u = users.find((m) => m.id === selectedUserId)}
											{u ? u.name.firstName[0] + u.name.lastName[0] : '?'}
										{:else}
											All
										{/if}
									</Avatar.Fallback>
								</Avatar.Root>
								{#if selectedUserId}
									{@const u = users.find((m) => m.id === selectedUserId)}
									{u ? u.name.firstName + ' ' + u.name.lastName : 'Staff'}
								{:else}
									All staff
								{/if}
								<ChevronDown size={12} class="text-muted-foreground" />
							</Button>
						{/snippet}
					</DropdownMenu.Trigger>
					<DropdownMenu.Content align="start" class="w-44">
						<DropdownMenu.Item onclick={() => (selectedUserId = null)}>All staff</DropdownMenu.Item>
						{#each users as user (user.id)}
							<DropdownMenu.Item onclick={() => (selectedUserId = user.id)}>
								{user.name.firstName}
								{user.name.lastName}
							</DropdownMenu.Item>
						{/each}
					</DropdownMenu.Content>
				</DropdownMenu.Root>

				<!-- Search -->
				<div class="relative flex-1">
					<Search
						size={13}
						class="absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground"
					/>
					<Input bind:value={search} placeholder="Services" class="h-8 pl-8 text-xs" />
				</div>

				<!-- Booking URL -->
				<div
					class="flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs text-muted-foreground"
				>
					<Avatar.Root class="size-4 text-[9px]">
						<Avatar.Fallback class="bg-primary text-[9px] text-primary-foreground"
							>A</Avatar.Fallback
						>
					</Avatar.Root>
					<span class="max-w-40 truncate">{bookingUrl}</span>
					<Tooltip.Provider>
						<Tooltip.Root>
							<Tooltip.Trigger>
								{#snippet child({ props })}
									<button
										type="button"
										onclick={copyBookingUrl}
										class="text-muted-foreground hover:text-foreground"
										{...props}
									>
										<Copy size={12} />
									</button>
								{/snippet}
							</Tooltip.Trigger>
							<Tooltip.Content>Copy booking URL</Tooltip.Content>
						</Tooltip.Root>
					</Tooltip.Provider>
				</div>
			</div>

			<!-- Service rows -->
			<div class="flex flex-1 flex-col overflow-y-auto">
				{#if servicesQuery.isPending || (selectedGroupId && servicesByGroupQuery.isPending) || (selectedUserId && servicesByUserQuery.isPending)}
					<div class="flex flex-1 items-center justify-center">
						<p class="text-sm text-muted-foreground">Loading...</p>
					</div>
				{:else if selectedGroupId && filteredServices.length === 0}
					<PikslotEmpty
						icon={InfoCircle}
						title="No services in this group"
						description="This group has no services yet. Assign services to this group to see them here."
						buttonLabel="Assing Services"
						onclick={() => {
							if (serviceGroupsQuery.isSuccess) {
								editingGroup = serviceGroupsQuery.data?.filter(
									(item) => item.id === selectedGroupId
								)[0];
								editGroupDialogOpen = true;
							}
						}}
					/>
				{:else if filteredServices.length === 0}
					<div class="flex flex-1 items-center justify-center">
						<p class="text-sm text-muted-foreground">No services found.</p>
					</div>
				{:else}
					{#each filteredServices as service (service.id)}
						<div
							onclick={() => goto(`/home/services/${service.id}/edit`)}
							class="flex cursor-pointer items-center gap-4 border-b px-5 py-3.5 hover:bg-accent/40"
						>
							<!-- Icon -->
							<div class="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
								<Adjustments size={16} class="text-muted-foreground" />
							</div>

							<!-- Title + meta -->
							<div class="flex flex-1 flex-col">
								<span class="text-sm font-medium">{service.title}</span>
								<span class="text-xs text-muted-foreground">
									{formatDuration(service.durationInMins)} · {formatCost(service.cost)}
								</span>
							</div>

							<!-- Copy link -->
							<Button
								variant="outline"
								size="sm"
								class="h-7 gap-1.5 text-xs"
								onclick={() => copyLink(service.id)}
							>
								<Link size={12} />
								Copy link
							</Button>

							<!-- More options -->
							<DropdownMenu.Root>
								<DropdownMenu.Trigger>
									{#snippet child({ props })}
										<Button variant="ghost" size="icon-sm" {...props}>
											<DotsVertical size={15} />
										</Button>
									{/snippet}
								</DropdownMenu.Trigger>
								<DropdownMenu.Content align="end" class="w-52">
									<DropdownMenu.Item
										class="cursor-pointer gap-2"
										onclick={() => goto(`/home/services/${service.id}/edit`)}
									>
										<Pencil size={14} class="text-muted-foreground" />
										Edit
									</DropdownMenu.Item>
									<DropdownMenu.Item
										class="cursor-pointer gap-2"
										onclick={(e) => {
											e.stopPropagation();
											window.open(`https://${bookingUrl}/service/${service.id}`, '_blank');
										}}
									>
										<ExternalLink size={14} class="text-muted-foreground" />
										Preview
									</DropdownMenu.Item>
									<DropdownMenu.Separator />
									<DropdownMenu.Item class="cursor-pointer gap-2">
										<Qrcode size={14} class="text-muted-foreground" />
										QR Code
									</DropdownMenu.Item>
									<DropdownMenu.Item
										class="cursor-pointer gap-2"
										onclick={(e) => {
											e.stopPropagation();
											navigator.share?.({ url: `https://${bookingUrl}/service/${service.id}` });
										}}
									>
										<Share size={14} class="text-muted-foreground" />
										Share
									</DropdownMenu.Item>
									<DropdownMenu.Separator />
									<DropdownMenu.Item
										class="cursor-pointer gap-2"
										closeOnSelect={false}
										onclick={(e) => e.stopPropagation()}
									>
										<EyeOff size={14} class="text-muted-foreground" />
										<span class="flex-1">Set to hidden</span>
										<Switch
											checked={service.isHiddenFromBookingPage}
											onclick={(e: MouseEvent) => e.stopPropagation()}
										/>
									</DropdownMenu.Item>
									<DropdownMenu.Item class="cursor-pointer gap-2">
										<Copy size={14} class="text-muted-foreground" />
										Duplicate
									</DropdownMenu.Item>
									<DropdownMenu.Separator />
									<DropdownMenu.Item
										class="cursor-pointer gap-2 text-destructive focus:text-destructive"
										onclick={(e) => {
											e.stopPropagation();
											deleteServiceId = service.id;
											deleteServiceTitle = service.title;
										}}
									>
										<Trash size={14} />
										Delete
									</DropdownMenu.Item>
								</DropdownMenu.Content>
							</DropdownMenu.Root>
						</div>
					{/each}
				{/if}
			</div>
		</div>
	</div>
{/if}
