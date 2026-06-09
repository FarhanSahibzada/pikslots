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
	import ChevronDown from '@tabler/icons-svelte/icons/chevron-down';
	import { createQuery } from '@tanstack/svelte-query';
	import { getServiceGroupsByBusinessQueryOptions } from '../api/service-group/get.service.groups.by.business.query';
	import { businessStore } from '$stores/business.svelte';
	import { IconBriefcase } from '@tabler/icons-svelte';
	import { goto } from '$app/navigation';

	// ── Mock data ───────────────────────────────────────────────────────────────

	interface ServiceItem {
		id: string;
		name: string;
		durationInMins: number;
		cost: number;
		groupId: string;
		staffInitials: string[];
	}

	const services: ServiceItem[] = [
		{
			id: '1',
			name: '15 Minutes Meeting',
			durationInMins: 15,
			cost: 0,
			groupId: '1',
			staffInitials: ['A']
		},
		{
			id: '2',
			name: '30 Minutes Meeting',
			durationInMins: 30,
			cost: 0,
			groupId: '1',
			staffInitials: ['A']
		},
		{
			id: '3',
			name: '1 Hour Meeting',
			durationInMins: 60,
			cost: 0,
			groupId: '1',
			staffInitials: ['A', 'A']
		},
		{
			id: '4',
			name: 'Deep Clean',
			durationInMins: 90,
			cost: 5000,
			groupId: '2',
			staffInitials: ['A']
		}
	];

	// ── State ───────────────────────────────────────────────────────────────────

	let search = $state('');
	let selectedGroupId = $state<string | null>(null);
	let newGroupDialogOpen = $state(false);

	// ── Queries ──────────────────────────────────────────────────────────────────

	const serviceGroupsQuery = createQuery(() => ({
		...getServiceGroupsByBusinessQueryOptions(businessStore.selectedBusiness?.id ?? ''),
		enabled: !!businessStore.selectedBusiness?.id
	}));

	const serviceGroups = $derived(serviceGroupsQuery.data ?? []);

	const bookingUrl = 'solverse.pikslots.com/afaq';

	// ── Derived ─────────────────────────────────────────────────────────────────

	const filteredServices = $derived(
		services.filter((s) => {
			const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase());
			const matchesGroup = selectedGroupId ? s.groupId === selectedGroupId : true;
			return matchesSearch && matchesGroup;
		})
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

<div class="flex h-full min-h-0 flex-1">
	<!-- ── Left: service groups sidebar ──────────────────────────────────────── -->
	<div class="flex w-64 shrink-0 flex-col border-r">
		<div class="flex items-center justify-between border-b px-4 py-3">
			<span class="text-sm font-semibold">Groups</span>
		</div>

		<div class="flex flex-1 flex-col overflow-y-auto">
			<Accordion.Root type="multiple" value={['services', 'classes']}>
				<!-- Services -->
				<Accordion.Item value="services" class="">
					<Accordion.Trigger
						class="px-3 py-2 text-sm font-medium hover:bg-accent hover:no-underline"
					>
						Services ({serviceGroups.length})
					</Accordion.Trigger>
					<Accordion.Content class="p-0">
						{#each serviceGroups as group (group.id)}
							<button
								type="button"
								onclick={() => (selectedGroupId = selectedGroupId === group.id ? null : group.id)}
								class="flex w-full items-center px-6 py-1.5 text-left text-sm transition-colors hover:bg-accent
									{selectedGroupId === group.id ? 'bg-accent font-medium' : 'text-muted-foreground'}"
							>
								{group.name}
							</button>
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
					<Accordion.Trigger
						class="px-3 py-2 text-sm font-medium hover:bg-accent hover:no-underline"
					>
						Classes (0)
					</Accordion.Trigger>
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
					<DropdownMenu.Item class="cursor-pointer gap-2" onclick={() => goto('/home/services/new')}>
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
								<Avatar.Fallback class="bg-primary text-[10px] text-primary-foreground"
									>A</Avatar.Fallback
								>
							</Avatar.Root>
							Afaq
							<ChevronDown size={12} class="text-muted-foreground" />
						</Button>
					{/snippet}
				</DropdownMenu.Trigger>
				<DropdownMenu.Content align="start" class="w-44">
					<DropdownMenu.Item>All staff</DropdownMenu.Item>
					<DropdownMenu.Item>Afaq Javed</DropdownMenu.Item>
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
					<Avatar.Fallback class="bg-primary text-[9px] text-primary-foreground">A</Avatar.Fallback>
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
			{#if filteredServices.length === 0}
				<div class="flex flex-1 items-center justify-center">
					<p class="text-sm text-muted-foreground">No services found.</p>
				</div>
			{:else}
				{#each filteredServices as service (service.id)}
					<div class="flex items-center gap-4 border-b px-5 py-3.5 hover:bg-accent/40">
						<!-- Icon -->
						<div class="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
							<Adjustments size={16} class="text-muted-foreground" />
						</div>

						<!-- Name + meta -->
						<div class="flex flex-1 flex-col">
							<span class="text-sm font-medium">{service.name}</span>
							<span class="text-xs text-muted-foreground">
								{formatDuration(service.durationInMins)} · {formatCost(service.cost)}
							</span>
						</div>

						<!-- Staff avatars -->
						<div class="flex items-center -space-x-1.5">
							{#each service.staffInitials as initial, i (i)}
								<Avatar.Root class="size-6 text-[10px] ring-2 ring-background">
									<Avatar.Fallback class="bg-primary text-[10px] text-primary-foreground">
										{initial}
									</Avatar.Fallback>
								</Avatar.Root>
							{/each}
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
							<DropdownMenu.Content align="end" class="w-36">
								<DropdownMenu.Item>Edit</DropdownMenu.Item>
								<DropdownMenu.Item>Duplicate</DropdownMenu.Item>
								<DropdownMenu.Separator />
								<DropdownMenu.Item class="text-destructive focus:text-destructive">
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

<NewServiceGroupDialog
	bind:open={newGroupDialogOpen}
	{services}
	onCreate={(name, serviceIds) => {
		console.log('create group', name, serviceIds);
		newGroupDialogOpen = false;
	}}
/>
