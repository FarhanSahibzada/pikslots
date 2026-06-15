<script lang="ts">
	import { createQuery, createMutation, useQueryClient } from '@tanstack/svelte-query';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { ConfirmDialog } from '$lib/components/ui/confirm-dialog/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { businessStore } from '$stores/business.svelte';
	import { getCustomersByBusinessQueryOptions } from '../api/customer/get.customers.by.business.query';
	import { deleteCustomerMutationOptions } from '../api/customer/delete.customer.mutation';
	import { editCustomerMutationOptions } from '../api/customer/edit.customer.mutation';
	import type { CustomerModel } from '../api/customer/models/customer-model';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';
	import Plus from '@tabler/icons-svelte/icons/plus';
	import Search from '@tabler/icons-svelte/icons/search';
	import Pencil from '@tabler/icons-svelte/icons/pencil';
	import DotsVertical from '@tabler/icons-svelte/icons/dots-vertical';
	import Phone from '@tabler/icons-svelte/icons/phone';
	import Mail from '@tabler/icons-svelte/icons/mail';
	import BuildingStore from '@tabler/icons-svelte/icons/building-store';
	import MapPin from '@tabler/icons-svelte/icons/map-pin';
	import ChevronDown from '@tabler/icons-svelte/icons/chevron-down';
	import Trash from '@tabler/icons-svelte/icons/trash';
	import CalendarPlus from '@tabler/icons-svelte/icons/calendar-plus';
	import { IconFileExport, IconFileImport } from '@tabler/icons-svelte';
	import AddNewCustomer from './dialog/add-new-customer.svelte';
	import EditCustomer from './dialog/edit-customer.svelte';
	import Copy from '@tabler/icons-svelte/icons/copy';
	import World from '@tabler/icons-svelte/icons/world';
	import BrandInstagram from '@tabler/icons-svelte/icons/brand-instagram';
	import BrandFacebook from '@tabler/icons-svelte/icons/brand-facebook';
	import BrandX from '@tabler/icons-svelte/icons/brand-x';
	import BrandYoutube from '@tabler/icons-svelte/icons/brand-youtube';
	import BrandLinkedin from '@tabler/icons-svelte/icons/brand-linkedin';

	// ── State ─────────────────────────────────────────────────────────────────

	let search = $state('');
	let selectedCustomerId = $state<string | null>(null);
	let activeTab = $state('about');
	let addCustomerOpen = $state(false);
	let editCustomerOpen = $state(false);
	let notesValue = $state('');
	let editingNotes = $state(false);

	$effect(() => {
		notesValue = selectedCustomer?.notes ?? '';
		editingNotes = false;
	});
	let deleteCustomerId = $state<string | null>(null);
	let deleteCustomerName = $state<string>('');

	// ── Query ─────────────────────────────────────────────────────────────────

	const customersQuery = createQuery(() => ({
		...getCustomersByBusinessQueryOptions(businessStore.selectedBusiness?.id ?? ''),
		enabled: !!businessStore.selectedBusiness?.id
	}));

	// ── Derived ───────────────────────────────────────────────────────────────

	const filteredCustomers = $derived(
		(customersQuery.data ?? []).filter((c) =>
			`${c.firstName} ${c.lastName}`.toLowerCase().includes(search.toLowerCase())
		)
	);

	const selectedCustomer = $derived(
		(customersQuery.data ?? []).find((c) => c.id === selectedCustomerId) ?? null
	);

	// ── Mutations ─────────────────────────────────────────────────────────────

	const queryClient = useQueryClient();

	const deleteCustomerMutation = createMutation(() => ({
		...deleteCustomerMutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['customers', businessStore.selectedBusiness?.id]
			});
			if (selectedCustomerId === deleteCustomerId) selectedCustomerId = null;
			deleteCustomerId = null;
			deleteCustomerName = '';
			toast.success('Customer deleted');
		},
		onError: () => toast.error('Failed to delete customer')
	}));

	const saveNotesMutation = createMutation(() => ({
		...editCustomerMutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['customers', businessStore.selectedBusiness?.id]
			});
			toast.success('Notes saved');
			editingNotes = false;
		},
		onError: () => toast.error('Failed to save notes')
	}));

	// ── Helpers ───────────────────────────────────────────────────────────────

	function getInitial(customer: CustomerModel): string {
		return customer.firstName.charAt(0).toUpperCase();
	}

	function formatAddress(customer: CustomerModel): string | null {
		const parts = [customer.address, customer.city, customer.state, customer.country].filter(
			Boolean
		);
		if (!parts.length) return null;
		const base = parts.join(', ');
		return customer.zipCode ? `${base} - ${customer.zipCode}` : base;
	}

	const SOCIAL_ICONS: Record<string, typeof World> = {
		website: World,
		instagram: BrandInstagram,
		facebook: BrandFacebook,
		x: BrandX,
		youtube: BrandYoutube,
		linkedin: BrandLinkedin
	};

	function copyToClipboard(text: string) {
		navigator.clipboard.writeText(text);
		toast.success('Copied to clipboard');
	}

	function confirmDelete(customer: CustomerModel) {
		deleteCustomerId = customer.id;
		deleteCustomerName = `${customer.firstName} ${customer.lastName}`;
	}
</script>

<div class="flex h-full overflow-hidden">
	<!-- ── Left panel ──────────────────────────────────────────────────────── -->
	<div class="flex w-96 shrink-0 flex-col border-r">
		<!-- Header -->
		<div class="flex items-center justify-between px-4 py-3">
			<h2 class="text-base font-semibold">Customers</h2>
			<Button onclick={() => (addCustomerOpen = true)}><Plus />Add</Button>
		</div>

		<!-- Tabs row: All | Options -->
		<div class="flex items-center gap-4 border-b px-4 pb-0">
			<button class="border-b-2 border-foreground pb-2 text-sm font-medium"> All </button>
			<DropdownMenu.Root>
				<DropdownMenu.Trigger>
					{#snippet child({ props })}
						<button
							{...props}
							class="ml-auto flex items-center gap-1 pb-2 text-sm text-muted-foreground hover:text-foreground"
						>
							Options <ChevronDown class="size-3" />
						</button>
					{/snippet}
				</DropdownMenu.Trigger>
				<DropdownMenu.Content align="start" class="w-40 cursor-pointer">
					<DropdownMenu.Item class="cursor-pointer"
						><IconFileImport></IconFileImport>Import Customers</DropdownMenu.Item
					>
					<DropdownMenu.Item class="cursor-pointer"
						><IconFileExport></IconFileExport>Export Customers</DropdownMenu.Item
					>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</div>

		<!-- Search -->
		<div class="px-4 py-2">
			<div class="relative">
				<Search class="absolute top-2 left-2.5 size-3.5 text-muted-foreground" />
				<Input bind:value={search} placeholder="Search" class="pl-8" />
			</div>
		</div>

		<!-- Customer list -->
		<div class="flex-1 overflow-y-auto">
			{#if customersQuery.isPending}
				<div class="flex items-center justify-center py-8 text-xs text-muted-foreground">
					Loading...
				</div>
			{:else if filteredCustomers.length === 0}
				<div class="flex items-center justify-center py-8 text-xs text-muted-foreground">
					No customers found
				</div>
			{:else}
				{#each filteredCustomers as customer (customer.id)}
					<div class="mx-auto w-87.5">
						<button
							onclick={() => {
								selectedCustomerId = customer.id;
								activeTab = 'about';
							}}
							class="flex w-full items-center gap-3 px-2 py-2.5 transition-colors
							{selectedCustomer?.id === customer.id ? 'bg-muted' : 'hover:bg-muted/50'}"
						>
							<Avatar.Root size="sm">
								{#if customer.profileImageUrl}
									<Avatar.Image
										src={customer.profileImageUrl}
										alt="{customer.firstName} {customer.lastName}"
									/>
								{/if}
								<Avatar.Fallback>{getInitial(customer)}</Avatar.Fallback>
							</Avatar.Root>
							<span class="text-sm">{customer.firstName} {customer.lastName}</span>
						</button>
					</div>
				{/each}
			{/if}
		</div>
	</div>

	<!-- ── Right panel ─────────────────────────────────────────────────────── -->
	{#if selectedCustomer}
		{@const customer = selectedCustomer}
		<div class="flex flex-1 flex-col overflow-hidden">
			<!-- Detail header -->
			<div class="flex items-center gap-3 px-6 py-4">
				<Avatar.Root class="size-12 text-base">
					{#if customer.profileImageUrl}
						<Avatar.Image
							src={customer.profileImageUrl}
							alt="{customer.firstName} {customer.lastName}"
						/>
					{/if}
					<Avatar.Fallback class="text-base">{getInitial(customer)}</Avatar.Fallback>
				</Avatar.Root>
				<span class="text-base font-semibold">{customer.firstName} {customer.lastName}</span>

				<div class="ml-auto flex items-center gap-1">
					<Button
						variant="ghost"
						size="icon"
						class="size-8"
						onclick={() => (editCustomerOpen = true)}
					>
						<Pencil class="size-4" />
					</Button>

					<DropdownMenu.Root>
						<DropdownMenu.Trigger>
							{#snippet child({ props })}
								<Button variant="ghost" size="icon" class="size-8" {...props}>
									<DotsVertical class="size-4" />
								</Button>
							{/snippet}
						</DropdownMenu.Trigger>
						<DropdownMenu.Content align="end">
							<DropdownMenu.Item
								class="text-destructive focus:text-destructive"
								onclick={() => confirmDelete(customer)}
							>
								<Trash class="size-4" />
								Delete customer
							</DropdownMenu.Item>
						</DropdownMenu.Content>
					</DropdownMenu.Root>

					<Button variant="outline" size="sm" class="gap-1.5">
						<CalendarPlus class="size-4" />
						Book appointment
					</Button>
				</div>
			</div>

			<!-- Tabs -->
			<Tabs.Root bind:value={activeTab} class="flex flex-1 flex-col overflow-hidden">
				<Tabs.List variant="line" class="h-auto  justify-start rounded-none  px-6 ">
					<Tabs.Trigger value="about" class="pb-2">About</Tabs.Trigger>
					<Tabs.Trigger value="notes" class="pb-2">Notes</Tabs.Trigger>
					<Tabs.Trigger value="appointments" class="pb-2">Appointments</Tabs.Trigger>
					<Tabs.Trigger value="updates" class="pb-2">Updates</Tabs.Trigger>
				</Tabs.List>

				<!-- About tab -->
				<Tabs.Content value="about" class="flex-1 overflow-y-auto px-6 py-4">
					<div class="flex flex-col gap-0.5">
						<!-- Phone -->
						<div class="flex items-center gap-3 py-2.5">
							<Phone class="size-4 shrink-0 text-muted-foreground" />
							{#if customer.primaryPhone}
								<span class="text-sm">{customer.primaryPhone}</span>
							{:else}
								<button
									class="text-sm text-primary underline underline-offset-2"
									onclick={() => goto(`/home/customers/${customer.id}/edit`)}
								>
									Add phone
								</button>
							{/if}
						</div>

						<!-- Email -->
						{#if customer.email}
							<div class="flex items-center gap-3 py-2.5">
								<Mail class="size-4 shrink-0 text-muted-foreground" />
								<span class="text-sm">{customer.email}</span>
							</div>
						{/if}

						<!-- Company -->
						{#if customer.company}
							<div class="flex items-center gap-3 py-2.5">
								<BuildingStore class="size-4 shrink-0 text-muted-foreground" />
								<span class="text-sm">{customer.company}</span>
							</div>
						{/if}

						<!-- Address -->
						{#if formatAddress(customer)}
							<div class="flex items-center gap-3 py-2.5">
								<MapPin class="size-4 shrink-0 text-muted-foreground" />
								<span class="text-sm">{formatAddress(customer)}</span>
							</div>
						{/if}

						<!-- Social links -->
						{#each Object.entries(customer.customerSocialLinks ?? {}) as [key, value] (key)}
							{@const Icon = SOCIAL_ICONS[key] ?? World}
							<div class="group flex items-center justify-start gap-3 py-2.5">
								<Icon class="size-4 shrink-0 text-muted-foreground" />
								<button
									class="truncate text-left text-sm underline underline-offset-2"
									onclick={() => copyToClipboard(value as string)}
									type="button">{value}</button
								>
								<Copy
									class="size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
								/>
							</div>
						{/each}
					</div>
				</Tabs.Content>

				<!-- Notes tab -->
				<Tabs.Content value="notes" class="flex-1 overflow-y-auto px-6 py-4">
					{#if customer.notes && !editingNotes}
						<!-- View mode -->
						<div class="group flex items-center justify-start gap-3">
							<p class="text-sm">{customer.notes}</p>
							<div class="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
								<Button
									variant="ghost"
									size="icon"
									class="size-7"
									onclick={() => {
										notesValue = customer.notes ?? '';
										editingNotes = true;
									}}
								>
									<Pencil class="size-3.5" />
								</Button>
								<Button
									variant="ghost"
									size="icon"
									class="size-7 text-destructive hover:text-destructive"
									disabled={saveNotesMutation.isPending}
									onclick={() => {
										if (!businessStore.selectedBusiness?.id) return;
										saveNotesMutation.mutate({
											...customer,
											notes: null,
											businessId: businessStore.selectedBusiness.id
										});
									}}
								>
									<Trash class="size-3.5" />
								</Button>
							</div>
						</div>
					{:else}
						<!-- Edit mode -->
						<Textarea
							bind:value={notesValue}
							placeholder="Add a note"
							class="min-h-40 resize-none"
						/>
						<div class="mt-3 flex justify-end gap-2">
							<Button
								variant="ghost"
								size="sm"
								onclick={() => {
									notesValue = customer.notes ?? '';
									editingNotes = false;
								}}
							>
								Cancel
							</Button>
							<Button
								size="sm"
								disabled={saveNotesMutation.isPending}
								onclick={() => {
									if (!businessStore.selectedBusiness?.id) return;
									saveNotesMutation.mutate({
										...customer,
										notes: notesValue || null,
										businessId: businessStore.selectedBusiness.id
									});
								}}
							>
								{saveNotesMutation.isPending ? 'Saving...' : 'Save'}
							</Button>
						</div>
					{/if}
				</Tabs.Content>

				<!-- Appointments tab -->
				<Tabs.Content value="appointments" class="flex-1 overflow-y-auto px-6 py-4">
					<p class="text-sm text-muted-foreground">No appointments yet.</p>
				</Tabs.Content>

				<!-- Updates tab -->
				<Tabs.Content value="updates" class="flex-1 overflow-y-auto px-6 py-4">
					<p class="text-sm text-muted-foreground">No updates yet.</p>
				</Tabs.Content>
			</Tabs.Root>
		</div>
	{:else}
		<div class="flex flex-1 items-center justify-center text-sm text-muted-foreground">
			Select a customer to view details
		</div>
	{/if}
</div>

<!-- Add customer dialog -->
<AddNewCustomer bind:open={addCustomerOpen} />

<!-- Edit customer dialog -->
{#if selectedCustomer}
	<EditCustomer bind:open={editCustomerOpen} customer={selectedCustomer} />
{/if}

<!-- Delete confirm dialog -->
<ConfirmDialog
	open={!!deleteCustomerId}
	title="Delete customer"
	description="Are you sure you want to delete {deleteCustomerName}? This action cannot be undone."
	confirmLabel="Delete"
	onConfirm={() => {
		if (!deleteCustomerId || !businessStore.selectedBusiness?.id) return;
		deleteCustomerMutation.mutate({
			customerId: deleteCustomerId,
			businessId: businessStore.selectedBusiness.id
		});
	}}
	onCancel={() => {
		deleteCustomerId = null;
		deleteCustomerName = '';
	}}
/>
