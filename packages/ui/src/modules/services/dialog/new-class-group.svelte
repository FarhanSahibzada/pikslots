<script lang="ts">
	import { Dialog } from 'bits-ui';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Field, FieldError } from '$lib/components/ui/field/index.js';
	import X from '@tabler/icons-svelte/icons/x';
	import Search from '@tabler/icons-svelte/icons/search';
	import School from '@tabler/icons-svelte/icons/school';
	import type { ClassModel } from '../../api/class/models/class-model';
	import { createMutation, useQueryClient } from '@tanstack/svelte-query';
	import { registerClassGroupMutationOptions } from '../../api/class-group/register.class.group.mutation';
	import { businessStore } from '$stores/business.svelte';
	import { superForm } from 'sveltekit-superforms';
	import { zod4 as zod } from 'sveltekit-superforms/adapters';
	import z from 'zod';
	import { toast } from 'svelte-sonner';

	interface Props {
		open: boolean;
		classes: ClassModel[];
	}

	let { open = $bindable(false), classes }: Props = $props();

	// ── Schema ───────────────────────────────────────────────────────────────────

	const NewClassGroupSchema = z.object({
		name: z.string().min(1, 'Title is required')
	});

	// ── Mutation ─────────────────────────────────────────────────────────────────

	const queryClient = useQueryClient();
	const registerMutation = createMutation(() => registerClassGroupMutationOptions());

	// ── Superform ────────────────────────────────────────────────────────────────

	const { form, errors, enhance } = superForm(
		{ name: '' },
		{
			validators: zod(NewClassGroupSchema),
			SPA: true,
			resetForm: false,
			onUpdate({ form }) {
				if (form.valid) {
					registerMutation.mutate({
						name: form.data.name,
						businessId: businessStore.selectedBusiness?.id ?? '',
						associatedClasses: [...selectedIds]
					});
				}
			}
		}
	);

	$effect(() => {
		if (registerMutation.isSuccess) {
			toast.success('Class group created');
			queryClient.invalidateQueries({ queryKey: ['class-groups'] });
			open = false;
			reset();
			registerMutation.reset();
		}
		if (registerMutation.isError) {
			toast.error(
				registerMutation.error?.response?.data?.message ?? 'Failed to create class group'
			);
			registerMutation.reset();
		}
	});

	// ── State ────────────────────────────────────────────────────────────────────

	let classSearch = $state('');
	let selectedIds = $state<Set<string>>(new Set());

	const filteredClasses = $derived(
		classes.filter((c) => c.title.toLowerCase().includes(classSearch.toLowerCase()))
	);

	const allSelected = $derived(
		filteredClasses.length > 0 && filteredClasses.every((c) => selectedIds.has(c.id))
	);

	const someSelected = $derived(
		filteredClasses.some((c) => selectedIds.has(c.id)) && !allSelected
	);

	function toggleSelectAll() {
		if (allSelected) {
			filteredClasses.forEach((c) => selectedIds.delete(c.id));
		} else {
			filteredClasses.forEach((c) => selectedIds.add(c.id));
		}
		selectedIds = new Set(selectedIds);
	}

	function toggleClass(id: string) {
		if (selectedIds.has(id)) {
			selectedIds.delete(id);
		} else {
			selectedIds.add(id);
		}
		selectedIds = new Set(selectedIds);
	}

	function handleCancel() {
		reset();
		open = false;
	}

	function reset() {
		$form.name = '';
		classSearch = '';
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
			<form use:enhance class="flex flex-col gap-5">
				<!-- Header -->
				<div class="flex items-center justify-between">
					<Dialog.Title class="text-xl font-semibold">New class group</Dialog.Title>
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
				<Field>
					<Label class="text-sm font-medium">Title <span class="text-destructive">*</span></Label>
					<Input
						bind:value={$form.name}
						placeholder="Enter group title"
						class="h-8 border-2 focus-visible:border-foreground focus-visible:ring-0"
					/>
					<FieldError errors={$errors.name?.map((e) => ({ message: e }))} />
				</Field>

				<!-- Classes section -->
				<div class="flex min-h-0 flex-1 flex-col gap-2">
					<Label class="text-sm font-medium">Classes</Label>

					<!-- Search -->
					<div class="relative">
						<Search
							size={15}
							class="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
						/>
						<Input bind:value={classSearch} placeholder="Search" class="h-8 pl-9" />
					</div>

					<!-- Select all row -->
					<div class="flex items-center justify-between px-1 py-1">
						<button type="button" class="flex items-center gap-2.5" onclick={toggleSelectAll}>
							<Checkbox checked={allSelected} indeterminate={someSelected} class="rounded-sm" />
							<span class="text-sm">Select all</span>
						</button>
						<span class="text-sm text-muted-foreground"
							>{selectedIds.size}/{filteredClasses.length}</span
						>
					</div>

					<!-- Class list -->
					<div class="flex flex-col gap-2 overflow-y-auto">
						{#each filteredClasses as cls (cls.id)}
							<button
								type="button"
								onclick={() => toggleClass(cls.id)}
								class="flex items-center gap-3 border px-3 py-3 text-left hover:bg-accent/40"
							>
								<Checkbox checked={selectedIds.has(cls.id)} class="shrink-0 rounded-sm" />
								<div class="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
									<School size={16} class="text-muted-foreground" />
								</div>
								<div class="flex flex-col">
									<span class="text-sm font-medium">{cls.title}</span>
									<span class="text-xs text-muted-foreground">
										{formatDuration(cls.durationInMins)} · {formatCost(cls.cost)}
									</span>
								</div>
							</button>
						{/each}
					</div>
				</div>

				<!-- Footer -->
				<div class="flex items-center justify-end gap-2 pt-1">
					<Button type="button" variant="ghost" onclick={handleCancel}>Cancel</Button>
					<Button
						type="submit"
						disabled={!$form.name.trim() || registerMutation.isPending}
						class="rounded-full px-5"
					>
						{registerMutation.isPending ? 'Creating...' : 'Create'}
					</Button>
				</div>
			</form>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
