<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import { Switch } from '$lib/components/ui/switch/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import ArrowLeft from '@tabler/icons-svelte/icons/arrow-left';
	import Photo from '@tabler/icons-svelte/icons/photo';
	import Upload from '@tabler/icons-svelte/icons/upload';
	import InfoCircle from '@tabler/icons-svelte/icons/info-circle';

	// ── Props ────────────────────────────────────────────────────────────────────

	interface Props {
		onBack?: () => void;
		onCreate?: (data: ServiceFormData) => void;
	}

	const { onBack, onCreate }: Props = $props();

	// ── Types ────────────────────────────────────────────────────────────────────

	interface TeamMember {
		id: string;
		name: string;
		initials: string;
	}

	interface ServiceFormData {
		title: string;
		description: string;
		durationInMins: number | null;
		bufferTimeInMins: number | null;
		cost: number | null;
		location: string;
		categoryId: string;
		isHidden: boolean;
		teamMemberIds: string[];
	}

	// ── Mock team data ───────────────────────────────────────────────────────────

	const teamMembers: TeamMember[] = [
		{ id: '1', name: 'Afaq Javaid', initials: 'AJ' },
		{ id: '2', name: 'Afaq Javed', initials: 'AJ' }
	];

	// ── State ────────────────────────────────────────────────────────────────────

	let title = $state('');
	let description = $state('');
	let durationRaw = $state('');
	let bufferRaw = $state('');
	let costRaw = $state('');
	let location = $state('');
	let categoryId = $state('');
	let isHidden = $state(false);
	let selectedMemberIds = $state<Set<string>>(new Set());
	let showPaymentBanner = $state(true);
	let imageFile = $state<File | null>(null);
	let imagePreview = $state<string | null>(null);
	let teamSearch = $state('');

	// ── Derived ──────────────────────────────────────────────────────────────────

	const canCreate = $derived(title.trim().length > 0 && durationRaw.trim().length > 0);

	const filteredTeam = $derived(
		teamMembers.filter((m) => m.name.toLowerCase().includes(teamSearch.toLowerCase()))
	);

	const allSelected = $derived(selectedMemberIds.size === teamMembers.length);
	const someSelected = $derived(selectedMemberIds.size > 0 && !allSelected);

	// ── Handlers ─────────────────────────────────────────────────────────────────

	function toggleMember(id: string) {
		const next = new Set(selectedMemberIds);
		if (next.has(id)) next.delete(id);
		else next.add(id);
		selectedMemberIds = next;
	}

	function toggleAll() {
		if (allSelected) {
			selectedMemberIds = new Set();
		} else {
			selectedMemberIds = new Set(teamMembers.map((m) => m.id));
		}
	}

	function handleImageChange(e: Event) {
		const file = (e.target as HTMLInputElement).files?.[0];
		if (!file) return;
		imageFile = file;
		imagePreview = URL.createObjectURL(file);
	}

	function handleCreate() {
		if (!canCreate) return;
		onCreate?.({
			title: title.trim(),
			description: description.trim(),
			durationInMins: durationRaw ? Number(durationRaw) : null,
			bufferTimeInMins: bufferRaw ? Number(bufferRaw) : null,
			cost: costRaw ? Math.round(Number(costRaw) * 100) : null,
			location,
			categoryId,
			isHidden,
			teamMemberIds: [...selectedMemberIds]
		});
	}
</script>

<div class="flex h-full min-h-0 flex-1 flex-col">
	<!-- ── Top bar ──────────────────────────────────────────────────────────────── -->
	<div class="flex items-center justify-between border-b px-6 py-3">
		<div class="flex items-center gap-3">
			<button
				type="button"
				onclick={onBack}
				class="text-muted-foreground transition-colors hover:text-foreground"
			>
				<ArrowLeft size={18} />
			</button>
			<span class="text-base font-semibold">New service</span>
		</div>
		<Button size="sm" disabled={!canCreate} onclick={handleCreate}>Create</Button>
	</div>

	<!-- ── Body ─────────────────────────────────────────────────────────────────── -->
	<div class="flex flex-1 overflow-hidden">
		<!-- Left column -->
		<div class="flex flex-1 flex-col gap-6 overflow-y-auto px-6 py-6">
			<!-- Service details heading -->
			<div>
				<h3 class="text-sm font-semibold">Service details</h3>
			</div>

			<!-- Image upload -->
			<div class="flex items-start gap-4">
				<div
					class="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted"
				>
					{#if imagePreview}
						<img src={imagePreview} alt="Service" class="h-full w-full object-cover" />
					{:else}
						<Photo size={24} class="text-muted-foreground" />
					{/if}
				</div>
				<div class="flex flex-col gap-1">
					<span class="text-sm font-medium">Service image</span>
					<span class="text-xs text-muted-foreground">Up to 5 MB in size</span>
					<label>
						<input type="file" accept="image/*" class="hidden" onchange={handleImageChange} />
						<Button variant="outline" size="sm" class="mt-1 cursor-pointer gap-2" tabindex={-1}>
							<Upload size={14} />
							Upload
						</Button>
					</label>
				</div>
			</div>

			<!-- Title -->
			<div class="flex flex-col gap-1.5">
				<Label for="title">Title <span class="text-destructive">*</span></Label>
				<Input
					id="title"
					bind:value={title}
					placeholder={`For example, "Introductory call"`}
					class="focus-visible:ring-primary"
				/>
			</div>

			<!-- Description -->
			<div class="flex flex-col gap-1.5">
				<Label for="description">Description</Label>
				<textarea
					id="description"
					bind:value={description}
					placeholder="Describe your service to Booking Page visitors"
					class="flex min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
				></textarea>
			</div>

			<!-- Duration / Buffer / Cost -->
			<div class="flex items-end gap-3">
				<!-- Duration -->
				<div class="flex flex-1 flex-col gap-1.5">
					<Label for="duration">Duration <span class="text-destructive">*</span></Label>
					<div class="relative">
						<Input
							id="duration"
							type="number"
							min="1"
							bind:value={durationRaw}
							placeholder="Enter duration"
							class="pr-12"
						/>
						<span
							class="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs text-muted-foreground"
							>mins</span
						>
					</div>
				</div>

				<!-- Buffer time -->
				<div class="flex flex-1 flex-col gap-1.5">
					<Label for="buffer" class="flex items-center gap-1">
						Buffer time
						<InfoCircle size={13} class="text-muted-foreground" />
					</Label>
					<div class="relative">
						<Input
							id="buffer"
							type="number"
							min="0"
							bind:value={bufferRaw}
							placeholder="Enter buffer time"
							class="pr-12"
						/>
						<span
							class="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs text-muted-foreground"
							>mins</span
						>
					</div>
				</div>

				<!-- Cost -->
				<div class="flex flex-1 flex-col gap-1.5">
					<Label for="cost">Cost</Label>
					<div class="relative">
						<span
							class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-xs text-muted-foreground"
							>Rs</span
						>
						<Input
							id="cost"
							type="number"
							min="0"
							bind:value={costRaw}
							placeholder="Enter cost"
							class="pl-8"
						/>
					</div>
				</div>
			</div>

			<!-- Location -->
			<div class="flex flex-col gap-1.5">
				<Label>Location</Label>
				<Select.Root type="single" bind:value={location}>
					<Select.Trigger class="w-full">
						{location || 'Select location'}
					</Select.Trigger>
					<Select.Content>
						<Select.Item value="in-person">In person</Select.Item>
						<Select.Item value="online">Online</Select.Item>
						<Select.Item value="phone">Phone</Select.Item>
					</Select.Content>
				</Select.Root>
			</div>

			<!-- Category -->
			<div class="flex flex-col gap-1.5">
				<Label>Category</Label>
				<Select.Root type="single" bind:value={categoryId}>
					<Select.Trigger class="w-full">
						{categoryId || 'Select one or more categories'}
					</Select.Trigger>
					<Select.Content>
						<Select.Item value="haircut">Haircut</Select.Item>
						<Select.Item value="color">Color</Select.Item>
						<Select.Item value="treatment">Treatment</Select.Item>
					</Select.Content>
				</Select.Root>
			</div>

			<!-- Set to hidden toggle -->
			<div class="flex items-center gap-3">
				<Switch id="hidden" bind:checked={isHidden} />
				<div class="flex flex-col">
					<Label for="hidden" class="cursor-pointer text-sm font-medium">Set to hidden</Label>
					<span class="text-xs text-muted-foreground"
						>When set to hidden, a service is not visible on your Booking Page.</span
					>
				</div>
			</div>
		</div>

		<!-- Divider -->
		<Separator orientation="vertical" />

		<!-- Right column — Team -->
		<div class="flex w-80 shrink-0 flex-col gap-3 overflow-y-auto px-6 py-6">
			<div>
				<h3 class="text-sm font-semibold">
					Team <span class="text-destructive">*</span>
				</h3>
				<p class="mt-0.5 text-xs text-muted-foreground">Who will provide this service?</p>
			</div>

			<!-- Team search -->
			<div class="relative">
				<svg
					class="absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground"
					width="13"
					height="13"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
				</svg>
				<Input bind:value={teamSearch} placeholder="Search" class="pl-8 text-sm" />
			</div>

			<!-- Select all -->
			<div class="flex items-center gap-2.5">
				<Checkbox
					id="select-all"
					checked={allSelected}
					indeterminate={someSelected}
					onCheckedChange={toggleAll}
					class="rounded"
				/>
				<label for="select-all" class="cursor-pointer text-sm">Select all</label>
			</div>

			<Separator />

			<!-- Team member list -->
			<div class="flex flex-col gap-1">
				{#each filteredTeam as member (member.id)}
					<div class="flex items-center gap-2.5 rounded-md px-1 py-1.5 hover:bg-accent">
						<Checkbox
							id="member-{member.id}"
							checked={selectedMemberIds.has(member.id)}
							onCheckedChange={() => toggleMember(member.id)}
							class="rounded"
						/>
						<Avatar.Root class="size-7 text-xs">
							<Avatar.Fallback class="bg-primary text-[11px] text-primary-foreground">
								{member.initials}
							</Avatar.Fallback>
						</Avatar.Root>
						<label for="member-{member.id}" class="cursor-pointer text-sm">{member.name}</label>
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>
