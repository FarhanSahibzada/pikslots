<script lang="ts">
	import { Dialog } from 'bits-ui';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import X from '@tabler/icons-svelte/icons/x';
	import Search from '@tabler/icons-svelte/icons/search';
	import Adjustments from '@tabler/icons-svelte/icons/adjustments';

	interface ServiceItem {
		id: string;
		name: string;
		durationInMins: number;
		cost: number;
	}

	interface Props {
		open: boolean;
		services: ServiceItem[];
		onCreate: (name: string, serviceIds: string[]) => void;
	}

	let { open = $bindable(false), services, onCreate }: Props = $props();

	let title = $state('');
	let serviceSearch = $state('');
	let selectedIds = $state<Set<string>>(new Set());

	const filteredServices = $derived(
		services.filter((s) => s.name.toLowerCase().includes(serviceSearch.toLowerCase()))
	);

	const allSelected = $derived(
		filteredServices.length > 0 && filteredServices.every((s) => selectedIds.has(s.id))
	);

	const someSelected = $derived(
		filteredServices.some((s) => selectedIds.has(s.id)) && !allSelected
	);

	function toggleSelectAll() {
		if (allSelected) {
			filteredServices.forEach((s) => selectedIds.delete(s.id));
		} else {
			filteredServices.forEach((s) => selectedIds.add(s.id));
		}
		selectedIds = new Set(selectedIds);
	}

	function toggleService(id: string) {
		if (selectedIds.has(id)) {
			selectedIds.delete(id);
		} else {
			selectedIds.add(id);
		}
		selectedIds = new Set(selectedIds);
	}

	function handleCreate() {
		if (!title.trim()) return;
		onCreate(title.trim(), [...selectedIds]);
		reset();
	}

	function handleCancel() {
		reset();
		open = false;
	}

	function reset() {
		title = '';
		serviceSearch = '';
		selectedIds = new Set();
	}

	function formatDuration(mins: number): string {
		if (mins < 60) return `${mins} mins`;
		const h = Math.floor(mins / 60);
		const m = mins % 60;
		return m > 0 ? `${h} hr ${m} mins` : `${h} hr`;
	}

	function formatCost(cost: number): string {
		return cost === 0 ? 'Free' : `$${(cost / 100).toFixed(2)}`;
	}

	const accentColors = [
		'border-l-teal-400',
		'border-l-slate-300',
		'border-l-yellow-400',
		'border-l-red-400',
		'border-l-blue-400',
		'border-l-purple-400'
	];
</script>

<Dialog.Root
	bind:open
	onOpenChange={(v) => {
		if (!v) reset();
	}}
>
	<Dialog.Portal>
		<Dialog.Overlay
			class="fixed inset-0 z-50 bg-black/50 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0"
		/>
		<Dialog.Content
			class="fixed top-1/2 left-1/2 z-50 flex max-h-[85vh] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col gap-5 rounded-2xl bg-background p-6 shadow-xl outline-none data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
		>
			<!-- Header -->
			<div class="flex items-center justify-between">
				<Dialog.Title class="text-xl font-semibold">New category</Dialog.Title>
				<Dialog.Close>
					{#snippet child({ props })}
						<button
							type="button"
							class="rounded-md p-1 text-muted-foreground hover:text-foreground"
							{...props}
						>
							<X size={18} />
						</button>
					{/snippet}
				</Dialog.Close>
			</div>

			<!-- Title field -->
			<div class="flex flex-col gap-1.5">
				<Label class="text-sm font-medium">Title <span class="text-destructive">*</span></Label>
				<Input
					bind:value={title}
					placeholder="Enter category title"
					class="h-8  border-2 focus-visible:border-foreground focus-visible:ring-0"
				/>
			</div>

			<!-- Services section -->
			<div class="flex min-h-0 flex-1 flex-col gap-2">
				<Label class="text-sm font-medium">Services</Label>

				<!-- Search -->
				<div class="relative">
					<Search
						size={15}
						class="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
					/>
					<Input bind:value={serviceSearch} placeholder="Search" class="h-8  pl-9" />
				</div>

				<!-- Select all row -->
				<div class="flex items-center justify-between px-1 py-1">
					<button type="button" class="flex items-center gap-2.5" onclick={toggleSelectAll}>
						<Checkbox checked={allSelected} indeterminate={someSelected} class="rounded-sm" />
						<span class="text-sm">Select all</span>
					</button>
					<span class="text-sm text-muted-foreground"
						>{selectedIds.size}/{filteredServices.length}</span
					>
				</div>

				<!-- Service list -->
				<div class="flex flex-col gap-2 overflow-y-auto">
					{#each filteredServices as service, i (service.id)}
						<button
							type="button"
							onclick={() => toggleService(service.id)}
							class="flex items-center gap-3 rounded-xl border border-l-4 px-3 py-3 text-left hover:bg-accent/40 {accentColors[
								i % accentColors.length
							]}"
						>
							<Checkbox checked={selectedIds.has(service.id)} class="shrink-0 rounded-sm" />
							<div class="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
								<Adjustments size={16} class="text-muted-foreground" />
							</div>
							<div class="flex flex-col">
								<span class="text-sm font-medium">{service.name}</span>
								<span class="text-xs text-muted-foreground">
									{formatDuration(service.durationInMins)} · {formatCost(service.cost)}
								</span>
							</div>
						</button>
					{/each}
				</div>
			</div>

			<!-- Footer -->
			<div class="flex items-center justify-end gap-2 pt-1">
				<Button variant="ghost" onclick={handleCancel}>Cancel</Button>
				<Button disabled={!title.trim()} onclick={handleCreate} class="rounded-full px-5">
					Create
				</Button>
			</div>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
