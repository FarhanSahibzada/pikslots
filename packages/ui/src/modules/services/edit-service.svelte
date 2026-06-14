<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import * as Command from '$lib/components/ui/command/index.js';
	import Check from '@tabler/icons-svelte/icons/check';
	import ChevronDown from '@tabler/icons-svelte/icons/chevron-down';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import { Switch } from '$lib/components/ui/switch/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { Field, FieldGroup, FieldError } from '$lib/components/ui/field/index.js';
	import ArrowLeft from '@tabler/icons-svelte/icons/arrow-left';
	import Photo from '@tabler/icons-svelte/icons/photo';
	import Upload from '@tabler/icons-svelte/icons/upload';
	import InfoCircle from '@tabler/icons-svelte/icons/info-circle';
	import { createQuery, createMutation, useQueryClient } from '@tanstack/svelte-query';
	import { getUsersInsideBusinessQueryOptions } from '../api/user/get.users.inside.business.query';
	import { getServiceGroupsByBusinessQueryOptions } from '../api/service-group/get.service.groups.by.business.query';
	import { getGroupsByServiceQueryOptions } from '../api/service-group/get.groups.by.service.query';
	import { getUsersByServiceQueryOptions } from '../api/service-user-assignment/get.users.by.service.query';
	import { getServicesByBusinessQueryOptions } from '../api/service/get.services.by.business.query';
	import { updateServiceMutationOptions } from '../api/service/update.service.mutation';
	import { businessStore } from '$stores/business.svelte';
	import type { BusinessUserModel } from '../api/user/models/user-model';
	import type { ServiceGroupModel } from '../api/service-group/models/service-group-model';
	import { superForm } from 'sveltekit-superforms';
	import { zod4 as zod } from 'sveltekit-superforms/adapters';
	import z from 'zod';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';

	// ── Props ────────────────────────────────────────────────────────────────────

	interface Props {
		serviceId: string | undefined;
		onBack?: () => void;
	}

	const { serviceId, onBack }: Props = $props();

	// ── Schema ───────────────────────────────────────────────────────────────────

	const UpdateServiceSchema = z.object({
		title: z.string().min(1, 'Title is required').max(255, 'Title is too long'),
		description: z.string().default(''),
		durationInMins: z.coerce.number().min(1, 'Duration must be at least 1 minute'),
		bufferTimeInMins: z.coerce.number().min(0).default(0),
		cost: z.coerce.number().min(0).default(0),
		isHiddenFromBookingPage: z.boolean().default(false)
	});

	// ── Queries ──────────────────────────────────────────────────────────────────

	const servicesQuery = createQuery(() => ({
		...getServicesByBusinessQueryOptions(businessStore.selectedBusiness?.id ?? ''),
		enabled: !!businessStore.selectedBusiness?.id
	}));

	const userQuery = createQuery(() => ({
		...getUsersInsideBusinessQueryOptions(businessStore.selectedBusiness?.id ?? ''),
		enabled: !!businessStore.selectedBusiness?.id
	}));

	const serviceGroupsQuery = createQuery(() => ({
		...getServiceGroupsByBusinessQueryOptions(businessStore.selectedBusiness?.id ?? ''),
		enabled: !!businessStore.selectedBusiness?.id
	}));

	const groupsByServiceQuery = createQuery(() => getGroupsByServiceQueryOptions(serviceId));

	const usersByServiceQuery = createQuery(() => getUsersByServiceQueryOptions(serviceId ?? null));

	const service = $derived(servicesQuery.data?.find((s) => s.id === serviceId));
	const teamMembers = $derived<BusinessUserModel[]>(userQuery.data ?? []);
	const serviceGroups = $derived<ServiceGroupModel[]>(serviceGroupsQuery.data ?? []);

	// ── Mutation ─────────────────────────────────────────────────────────────────

	const queryClient = useQueryClient();
	const updateMutation = createMutation(updateServiceMutationOptions);

	// ── Superform ────────────────────────────────────────────────────────────────

	const { form, errors, enhance } = superForm(
		{
			title: '',
			description: '',
			durationInMins: 0,
			bufferTimeInMins: 0,
			cost: 0,
			isHiddenFromBookingPage: false
		},
		{
			validators: zod(UpdateServiceSchema),
			SPA: true,
			resetForm: false,
			onUpdate({ form }) {
				if (form.valid && serviceId && businessStore.selectedBusiness?.id) {
					updateMutation.mutate({
						id: serviceId,
						title: form.data.title,
						description: form.data.description,
						durationInMins: form.data.durationInMins,
						bufferTimeInMins: form.data.bufferTimeInMins,
						cost: Math.round(form.data.cost * 100),
						isHiddenFromBookingPage: form.data.isHiddenFromBookingPage,
						imagesUrls: [],
						associatedUsers: [...selectedMemberIds],
						associatedServiceGroups: [...selectedGroupIds],
						businessId: businessStore.selectedBusiness.id
					});
				}
			}
		}
	);

	// Pre-fill selected groups when query loads
	$effect(() => {
		if (groupsByServiceQuery.data) {
			selectedGroupIds = new Set(groupsByServiceQuery.data.map((g) => g.id));
		}
	});

	// Pre-fill selected members when query loads
	$effect(() => {
		if (usersByServiceQuery.data) {
			selectedMemberIds = new Set(usersByServiceQuery.data.map((u) => u.id));
		}
	});

	// Pre-fill form when service data loads
	$effect(() => {
		if (service) {
			$form.title = service.title;
			$form.description = service.description;
			$form.durationInMins = service.durationInMins;
			$form.bufferTimeInMins = service.bufferTimeInMins;
			$form.cost = service.cost / 100;
			$form.isHiddenFromBookingPage = service.isHiddenFromBookingPage;
		}
	});

	$effect(() => {
		if (updateMutation.isSuccess) {
			queryClient.invalidateQueries({ queryKey: ['services'] });
			queryClient.invalidateQueries({ queryKey: ['service-group-assignments'] });
			queryClient.invalidateQueries({ queryKey: ['service-user-assignments'] });
			toast.success('Service updated successfully');
			goto('/home/services');
		}
		if (updateMutation.isError) {
			toast.error(updateMutation.error?.response?.data?.message ?? 'Failed to update service');
			updateMutation.reset();
		}
	});

	// ── State ────────────────────────────────────────────────────────────────────

	let selectedMemberIds = $state<Set<string>>(new Set());
	let selectedGroupIds = $state<Set<string>>(new Set());
	let groupComboOpen = $state(false);
	let imageFile = $state<File | null>(null);
	let imagePreview = $state<string | null>(null);
	let teamSearch = $state('');

	// ── Derived ──────────────────────────────────────────────────────────────────

	const canSave = $derived($form.title.trim().length > 0 && Number($form.durationInMins) >= 1);

	const filteredTeam = $derived(
		teamMembers.filter((m) =>
			`${m.name.firstName} ${m.name.lastName}`.toLowerCase().includes(teamSearch.toLowerCase())
		)
	);

	const allSelected = $derived(
		teamMembers.length > 0 && selectedMemberIds.size === teamMembers.length
	);
	const someSelected = $derived(selectedMemberIds.size > 0 && !allSelected);

	// ── Handlers ─────────────────────────────────────────────────────────────────

	function toggleGroup(id: string) {
		const next = new Set(selectedGroupIds);
		if (next.has(id)) next.delete(id);
		else next.add(id);
		selectedGroupIds = next;
	}

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
</script>

{#if servicesQuery.isPending}
	<div class="flex flex-1 items-center justify-center">
		<p class="text-sm text-muted-foreground">Loading...</p>
	</div>
{:else if !service}
	<div class="flex flex-1 items-center justify-center">
		<p class="text-sm text-muted-foreground">Service not found.</p>
	</div>
{:else}
	<form use:enhance class="mx-auto flex h-full min-h-0 w-[70%] flex-1 flex-col">
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
				<span class="text-base font-semibold">Edit service</span>
			</div>
			<Button type="submit" size="sm" disabled={!canSave || updateMutation.isPending}>
				{updateMutation.isPending ? 'Saving...' : 'Save'}
			</Button>
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

				<FieldGroup>
					<!-- Title -->
					<Field>
						<Label for="title">Title <span class="text-destructive">*</span></Label>
						<Input
							id="title"
							bind:value={$form.title}
							placeholder={`For example, "Introductory call"`}
							class="focus-visible:ring-primary"
						/>
						<FieldError errors={$errors.title?.map((e) => ({ message: e }))} />
					</Field>

					<!-- Description -->
					<Field>
						<Label for="description">Description</Label>
						<textarea
							id="description"
							bind:value={$form.description}
							placeholder="Describe your service to Booking Page visitors"
							class="flex min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
						></textarea>
					</Field>

					<!-- Duration / Buffer / Cost -->
					<div class="flex items-start gap-3">
						<!-- Duration -->
						<Field class="flex-1">
							<Label for="duration">Duration <span class="text-destructive">*</span></Label>
							<div class="relative">
								<Input
									id="duration"
									type="number"
									min="1"
									bind:value={$form.durationInMins}
									placeholder="Enter duration"
									class="[appearance:textfield] pr-12 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
								/>
								<span
									class="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs text-muted-foreground"
									>mins</span
								>
							</div>
							<FieldError errors={$errors.durationInMins?.map((e) => ({ message: e }))} />
						</Field>

						<!-- Buffer time -->
						<Field class="flex-1">
							<Label for="buffer" class="flex items-center gap-1">
								Buffer time
								<InfoCircle size={13} class="text-muted-foreground" />
							</Label>
							<div class="relative">
								<Input
									id="buffer"
									type="number"
									min="0"
									bind:value={$form.bufferTimeInMins}
									placeholder="Enter buffer time"
									class="[appearance:textfield] pr-12 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
								/>
								<span
									class="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs text-muted-foreground"
									>mins</span
								>
							</div>
							<FieldError errors={$errors.bufferTimeInMins?.map((e) => ({ message: e }))} />
						</Field>

						<!-- Cost -->
						<Field class="flex-1">
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
									bind:value={$form.cost}
									placeholder="Enter cost"
									class="[appearance:textfield] pl-8 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
								/>
							</div>
							<FieldError errors={$errors.cost?.map((e) => ({ message: e }))} />
						</Field>
					</div>
				</FieldGroup>

				<!-- Groups combobox -->
				<div class="flex flex-col gap-1.5">
					<Label>Service Groups</Label>
					<Popover.Root bind:open={groupComboOpen}>
						<Popover.Trigger>
							{#snippet child({ props })}
								<button
									type="button"
									{...props}
									class="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
								>
									<span
										class="truncate text-left {selectedGroupIds.size === 0
											? 'text-muted-foreground'
											: ''}"
									>
										{#if selectedGroupIds.size === 0}
											Select service groups
										{:else}
											{serviceGroups
												.filter((g) => selectedGroupIds.has(g.id))
												.map((g) => g.name)
												.join(', ')}
										{/if}
									</span>
									<ChevronDown size={14} class="shrink-0 text-muted-foreground" />
								</button>
							{/snippet}
						</Popover.Trigger>
						<Popover.Content class="w-64 p-0" align="start">
							<Command.Root>
								<Command.Input placeholder="Search groups..." />
								<Command.List>
									<Command.Empty>No groups found.</Command.Empty>
									<Command.Group>
										{#each serviceGroups as group (group.id)}
											<Command.Item value={group.name} onSelect={() => toggleGroup(group.id)}>
												<Check
													size={14}
													class="mr-2 shrink-0 {selectedGroupIds.has(group.id)
														? 'opacity-100'
														: 'opacity-0'}"
												/>
												{group.name}
											</Command.Item>
										{/each}
									</Command.Group>
								</Command.List>
							</Command.Root>
						</Popover.Content>
					</Popover.Root>
				</div>

				<!-- Set to hidden toggle -->
				<div class="flex items-center gap-3">
					<Switch id="hidden" bind:checked={$form.isHiddenFromBookingPage} />
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
									{member.name.firstName[0]}{member.name.lastName[0]}
								</Avatar.Fallback>
							</Avatar.Root>
							<label for="member-{member.id}" class="cursor-pointer text-sm"
								>{member.name.firstName} {member.name.lastName}</label
							>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</form>
{/if}
