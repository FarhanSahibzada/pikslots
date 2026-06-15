<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import CircleHalf from '@tabler/icons-svelte/icons/circle-half';
	import DeviceTablet from '@tabler/icons-svelte/icons/device-tablet';
	import DeviceDesktop from '@tabler/icons-svelte/icons/device-desktop';
	import Plus from '@tabler/icons-svelte/icons/plus';
	import Phone from '@tabler/icons-svelte/icons/phone';
	import Mail from '@tabler/icons-svelte/icons/mail';
	import { businessStore } from '../../../core/store/business.svelte';
	import { createMutation } from '@tanstack/svelte-query';
	import { updateBusinessContactDetails } from '../../../api/business/update.business.contact.details.mutation';
	import type {
		BusinessUpdateContactDetailsInput,
		BusinessUpdateContactDetailsResult
	} from '../../../api/business/models/business-model';
	import type { BaseErrorResponse } from '@pikslots/shared';
	import type { AxiosError } from 'axios';
	import { toast } from 'svelte-sonner';

	const countryCodes = [
		{ value: '+1', label: '+1 US' },
		{ value: '+44', label: '+44 UK' },
		{ value: '+92', label: '+92 PK' },
		{ value: '+91', label: '+91 IN' },
		{ value: '+61', label: '+61 AU' },
		{ value: '+49', label: '+49 DE' },
		{ value: '+33', label: '+33 FR' }
	];

	type ExtraField =
		| { kind: 'phone'; countryCode: string; value: string }
		| { kind: 'email'; value: string };

	const business = $derived(businessStore.selectedBusiness);

	let primaryEmail = $state('');
	let primaryCountryCode = $state('+1');
	let primaryPhone = $state('');
	let extraFields = $state<ExtraField[]>([]);
	let previewDevice = $state<'tablet' | 'desktop'>('tablet');

	$effect(() => {
		if (business) {
			primaryEmail = business.contactDetails.primaryEmail;
			primaryCountryCode = business.contactDetails.primaryPhone.countryCode;
			primaryPhone = business.contactDetails.primaryPhone.number;
			const extras: ExtraField[] = [
				...business.contactDetails.additionalEmails.map((e) => ({
					kind: 'email' as const,
					value: e
				})),
				...business.contactDetails.additionalPhones.map((p) => ({
					kind: 'phone' as const,
					countryCode: p.countryCode,
					value: p.number
				}))
			];
			extraFields = extras;
		}
	});

	const isDirty = $derived(
		!!business &&
			(primaryEmail !== business.contactDetails.primaryEmail ||
				primaryCountryCode !== business.contactDetails.primaryPhone.countryCode ||
				primaryPhone !== business.contactDetails.primaryPhone.number ||
				extraFields.length !==
					business.contactDetails.additionalEmails.length +
						business.contactDetails.additionalPhones.length ||
				extraFields.some((f, i) => {
					if (f.kind === 'email') {
						const stored =
							business.contactDetails.additionalEmails[
								extraFields.slice(0, i).filter((x) => x.kind === 'email').length
							];
						return f.value !== (stored ?? '');
					} else {
						const idx = extraFields.slice(0, i).filter((x) => x.kind === 'phone').length;
						const stored = business.contactDetails.additionalPhones[idx];
						return (
							f.value !== (stored?.number ?? '') || f.countryCode !== (stored?.countryCode ?? '+1')
						);
					}
				}))
	);

	const updateMutation = createMutation<
		BusinessUpdateContactDetailsResult,
		AxiosError<BaseErrorResponse>,
		BusinessUpdateContactDetailsInput
	>(() => ({
		mutationFn: updateBusinessContactDetails
	}));

	$effect(() => {
		if (updateMutation.data) {
			businessStore.setSelectedBusiness(updateMutation.data);
			toast.success('Contact details saved successfully.');
		}
		if (updateMutation.isError) {
			toast.error(
				updateMutation.error?.response?.data?.message ?? 'Failed to save. Please try again.'
			);
		}
	});

	function handleSave() {
		if (!business) return;
		updateMutation.mutate({
			id: business.id,
			primaryEmail,
			primaryPhone: { countryCode: primaryCountryCode, number: primaryPhone },
			additionalEmails: extraFields
				.filter((f): f is Extract<ExtraField, { kind: 'email' }> => f.kind === 'email')
				.map((f) => f.value),
			additionalPhones: extraFields
				.filter((f): f is Extract<ExtraField, { kind: 'phone' }> => f.kind === 'phone')
				.map((f) => ({ countryCode: f.countryCode, number: f.value }))
		});
	}

	function handleCancel() {
		if (!business) return;
		primaryEmail = business.contactDetails.primaryEmail;
		primaryCountryCode = business.contactDetails.primaryPhone.countryCode;
		primaryPhone = business.contactDetails.primaryPhone.number;
		extraFields = [
			...business.contactDetails.additionalEmails.map((e) => ({
				kind: 'email' as const,
				value: e
			})),
			...business.contactDetails.additionalPhones.map((p) => ({
				kind: 'phone' as const,
				countryCode: p.countryCode,
				value: p.number
			}))
		];
	}

	function addPhone() {
		extraFields = [...extraFields, { kind: 'phone', countryCode: '+1', value: '' }];
	}

	function addEmail() {
		extraFields = [...extraFields, { kind: 'email', value: '' }];
	}
</script>

<!-- Page header -->
<div class="border-b px-4 lg:px-6">
	<div class="flex items-center justify-between py-3">
		<div class="flex items-center gap-3">
			<h1 class="text-sm font-semibold">Your brand</h1>
			<div class="flex items-center gap-1.5 text-xs text-muted-foreground">
				<CircleHalf size={14} />
				<span>35% complete</span>
			</div>
		</div>
		<div class="flex items-center gap-2">
			<Button
				variant="outline"
				size="sm"
				onclick={handleCancel}
				disabled={!isDirty || updateMutation.isPending}
			>
				Cancel
			</Button>
			<Button size="sm" onclick={handleSave} disabled={!isDirty || updateMutation.isPending}>
				{updateMutation.isPending ? 'Saving...' : 'Save'}
			</Button>
		</div>
	</div>
</div>

<!-- Two column layout -->
<div class="grid flex-1 grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-2 lg:px-6">
	<!-- Left: Form -->
	<div class="flex flex-col gap-8">
		<section class="flex flex-col gap-5">
			<div class="flex flex-col gap-1">
				<h2 class="text-xs font-semibold">Contact details</h2>
				<p class="text-xs text-muted-foreground">
					Let your leads and customers know how to reach you.
				</p>
			</div>

			<!-- Primary email -->
			<div class="flex flex-col gap-2">
				<Label for="primary-email">Primary email</Label>
				<Input id="primary-email" type="email" bind:value={primaryEmail} placeholder="" />
			</div>

			<!-- Primary phone -->
			<div class="flex flex-col gap-2">
				<Label>Primary phone</Label>
				<div class="flex gap-2">
					<Select.Root type="single" bind:value={primaryCountryCode}>
						<Select.Trigger class="w-24 shrink-0">
							{primaryCountryCode}
						</Select.Trigger>
						<Select.Content>
							{#each countryCodes as cc (cc.value)}
								<Select.Item value={cc.value}>{cc.label}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
					<Input type="tel" bind:value={primaryPhone} placeholder="" class="flex-1" />
				</div>
			</div>

			{#each extraFields as field, i (i)}
				{#if field.kind === 'phone'}
					<div class="flex flex-col gap-2">
						<Label>Additional phone</Label>
						<div class="flex gap-2">
							<Select.Root type="single" bind:value={field.countryCode}>
								<Select.Trigger class="w-24 shrink-0">
									{field.countryCode}
								</Select.Trigger>
								<Select.Content>
									{#each countryCodes as cc (cc.value)}
										<Select.Item value={cc.value}>{cc.label}</Select.Item>
									{/each}
								</Select.Content>
							</Select.Root>
							<Input type="tel" bind:value={field.value} placeholder="" class="flex-1" />
						</div>
					</div>
				{:else}
					<div class="flex flex-col gap-2">
						<Label>Additional email</Label>
						<Input type="email" bind:value={field.value} placeholder="" />
					</div>
				{/if}
			{/each}

			<DropdownMenu.Root>
				<DropdownMenu.Trigger>
					{#snippet child({ props })}
						<Button
							{...props}
							variant="ghost"
							size="sm"
							class="w-fit gap-1.5 px-0 text-muted-foreground hover:text-foreground"
						>
							<Plus size={14} />
							Add more
						</Button>
					{/snippet}
				</DropdownMenu.Trigger>
				<DropdownMenu.Content align="start" class="w-44">
					<DropdownMenu.Item class="flex items-center gap-2" onclick={addPhone}>
						<Phone size={15} class="text-muted-foreground" />
						Additional phone
					</DropdownMenu.Item>
					<DropdownMenu.Item class="flex items-center gap-2" onclick={addEmail}>
						<Mail size={15} class="text-muted-foreground" />
						Additional email
					</DropdownMenu.Item>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</section>
	</div>

	<!-- Right: Preview -->
	<div class="flex flex-col gap-3">
		<div class="flex items-center justify-between">
			<span class="text-xs font-medium">Preview</span>
			<div class="flex items-center gap-1">
				<Button
					variant={previewDevice === 'tablet' ? 'secondary' : 'ghost'}
					size="icon-sm"
					onclick={() => (previewDevice = 'tablet')}
				>
					<DeviceTablet size={16} />
				</Button>
				<Button
					variant={previewDevice === 'desktop' ? 'secondary' : 'ghost'}
					size="icon-sm"
					onclick={() => (previewDevice = 'desktop')}
				>
					<DeviceDesktop size={16} />
				</Button>
			</div>
		</div>

		<Card.Root class="overflow-hidden">
			<div class="border-b px-4 py-2">
				<div
					class="flex items-center gap-2 rounded-md bg-muted px-3 py-1.5 text-xs text-muted-foreground"
				>
					<span>https://</span>
					<span class="font-medium text-foreground">your-slug</span>
					<span>.pikslots.com</span>
				</div>
			</div>
			<Card.Content class="flex min-h-96 items-center justify-center bg-muted/40 p-6">
				<div class="flex flex-col items-center gap-2 text-center text-xs text-muted-foreground">
					{#if previewDevice === 'tablet'}
						<DeviceTablet size={32} />
					{:else}
						<DeviceDesktop size={32} />
					{/if}
					<span>Preview will appear here</span>
				</div>
			</Card.Content>
		</Card.Root>
	</div>
</div>
