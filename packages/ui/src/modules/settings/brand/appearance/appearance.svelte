<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import CircleHalf from '@tabler/icons-svelte/icons/circle-half';
	import DeviceTablet from '@tabler/icons-svelte/icons/device-tablet';
	import DeviceDesktop from '@tabler/icons-svelte/icons/device-desktop';
	import Photo from '@tabler/icons-svelte/icons/photo';
	import Sun from '@tabler/icons-svelte/icons/sun';
	import Moon from '@tabler/icons-svelte/icons/moon';
	import DeviceDesktop2 from '@tabler/icons-svelte/icons/device-desktop';
	import type { BrandButtonShape, BrandTheme } from '@pikslots/shared';
	import { businessStore } from '../../../core/store/business.svelte';
	import { createMutation } from '@tanstack/svelte-query';
	import { updateBusinessAppearance } from '../../../api/business/update.business.appearance.mutation';
	import type {
		BusinessUpdateAppearanceInput,
		BusinessUpdateAppearanceResult
	} from '../../../api/business/models/business-model';
	import type { BaseErrorResponse } from '@pikslots/shared';
	import type { AxiosError } from 'axios';
	import { toast } from 'svelte-sonner';

	const brandColors = [
		{ value: '#111111', label: 'Black' },
		{ value: '#c0392b', label: 'Red' },
		{ value: '#e67e22', label: 'Orange' },
		{ value: '#f1c40f', label: 'Yellow' },
		{ value: '#8e44ad', label: 'Purple' },
		{ value: '#2980b9', label: 'Blue' },
		{ value: '#b5a17a', label: 'Tan' },
		{ value: '#95a5a6', label: 'Gray' },
		{ value: '#16a085', label: 'Teal' },
		{ value: '#27ae60', label: 'Green' },
		{ value: '#1a1a1a', label: 'Charcoal' }
	];

	const business = $derived(businessStore.selectedBusiness);

	let selectedColor = $state('#1a1a1a');
	let selectedShape = $state<BrandButtonShape>('pill');
	let selectedTheme = $state<BrandTheme>('system');
	let gallaryPhotosUrls = $state<string[]>([]);
	let previewDevice = $state<'tablet' | 'desktop'>('tablet');

	$effect(() => {
		if (business) {
			selectedColor = business.brandAppearanceDetails.brandColor;
			selectedShape = business.brandAppearanceDetails.brandButtonShape;
			selectedTheme = business.brandAppearanceDetails.theme;
			gallaryPhotosUrls = [...business.brandAppearanceDetails.gallaryPhotosUrls];
		}
	});

	const isDirty = $derived(
		!!business &&
			(selectedColor !== business.brandAppearanceDetails.brandColor ||
				selectedShape !== business.brandAppearanceDetails.brandButtonShape ||
				selectedTheme !== business.brandAppearanceDetails.theme ||
				JSON.stringify(gallaryPhotosUrls) !==
					JSON.stringify(business.brandAppearanceDetails.gallaryPhotosUrls))
	);

	function removePhoto(url: string) {
		gallaryPhotosUrls = gallaryPhotosUrls.filter((u) => u !== url);
	}

	const updateMutation = createMutation<
		BusinessUpdateAppearanceResult,
		AxiosError<BaseErrorResponse>,
		BusinessUpdateAppearanceInput
	>(() => ({
		mutationFn: updateBusinessAppearance
	}));

	$effect(() => {
		if (updateMutation.data) {
			businessStore.setSelectedBusiness(updateMutation.data);
			toast.success('Appearance saved successfully.');
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
			brandColor: selectedColor,
			brandButtonShape: selectedShape,
			theme: selectedTheme,
			gallaryPhotosUrls
		});
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
		<Button size="sm" onclick={handleSave} disabled={!isDirty || updateMutation.isPending}>
			{updateMutation.isPending ? 'Saving...' : 'Save'}
		</Button>
	</div>
</div>

<!-- Two column layout -->
<div class="grid flex-1 grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-2 lg:px-6">
	<!-- Left: Form -->
	<div class="flex flex-col gap-8">
		<section class="flex flex-col gap-1">
			<h2 class="text-xs font-semibold">Appearance</h2>
			<p class="text-xs text-muted-foreground">
				Style your Booking Page to reflect your brand identity.
			</p>
		</section>

		<!-- Brand color -->
		<section class="flex flex-col gap-3">
			<h3 class="text-xs font-medium">Brand color</h3>
			{#if business === null}
				<div class="flex flex-wrap gap-2">
					{#each Array(11) as _}
						<Skeleton class="size-8 rounded-full" />
					{/each}
				</div>
			{:else}
				<div class="flex flex-wrap gap-2">
					{#each brandColors as color (color.value)}
						<button
							type="button"
							onclick={() => (selectedColor = color.value)}
							title={color.label}
							class="relative size-8 rounded-full transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
							style="background-color: {color.value};"
						>
							{#if selectedColor === color.value}
								<span
									class="absolute inset-0 flex items-center justify-center rounded-full ring-2 ring-foreground ring-offset-2"
								>
									<svg
										class="size-3.5 text-white drop-shadow"
										viewBox="0 0 12 12"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
									>
										<path d="M2 6l3 3 5-5" />
									</svg>
								</span>
							{/if}
						</button>
					{/each}
				</div>
			{/if}
		</section>

		<!-- Button shape -->
		<section class="flex flex-col gap-3">
			<h3 class="text-xs font-medium">Button shape</h3>
			{#if business === null}
				<div class="grid grid-cols-3 gap-3">
					{#each Array(3) as _}
						<Skeleton class="h-24 rounded-lg" />
					{/each}
				</div>
			{:else}
				<div class="grid grid-cols-3 gap-3">
					{#each [{ value: 'pill' as BrandButtonShape, label: 'Pill' }, { value: 'rounded' as BrandButtonShape, label: 'Rounded' }, { value: 'rectangle' as BrandButtonShape, label: 'Rectangle' }] as shape (shape.value)}
						<button
							type="button"
							onclick={() => (selectedShape = shape.value)}
							class="relative flex flex-col items-center gap-3 rounded-lg border p-4 text-xs transition-colors hover:bg-accent
								{selectedShape === shape.value ? 'border-foreground bg-accent/30' : 'border-border'}"
						>
							<span
								class="absolute top-3 left-3 flex size-4 items-center justify-center rounded-full border-2
									{selectedShape === shape.value ? 'border-foreground' : 'border-muted-foreground'}"
							>
								{#if selectedShape === shape.value}
									<span class="size-2 rounded-full bg-foreground"></span>
								{/if}
							</span>
							<div class="mt-3 flex items-center justify-center">
								{#if shape.value === 'pill'}
									<div class="h-6 w-16 rounded-full border-2 border-current"></div>
								{:else if shape.value === 'rounded'}
									<div class="h-6 w-16 rounded-md border-2 border-current"></div>
								{:else}
									<div class="h-6 w-16 rounded-none border-2 border-current"></div>
								{/if}
							</div>
							<span class="font-medium">{shape.label}</span>
						</button>
					{/each}
				</div>
			{/if}
		</section>

		<!-- Theme -->
		<section class="flex flex-col gap-3">
			<h3 class="text-xs font-medium">Theme</h3>
			{#if business === null}
				<div class="grid grid-cols-3 gap-3">
					{#each Array(3) as _}
						<Skeleton class="h-24 rounded-lg" />
					{/each}
				</div>
			{:else}
				<div class="grid grid-cols-3 gap-3">
					{#each [{ value: 'system' as BrandTheme, label: 'System' }, { value: 'light' as BrandTheme, label: 'Light' }, { value: 'dark' as BrandTheme, label: 'Dark' }] as theme (theme.value)}
						<button
							type="button"
							onclick={() => (selectedTheme = theme.value)}
							class="relative flex flex-col items-center gap-3 rounded-lg border p-4 text-xs transition-colors hover:bg-accent
								{selectedTheme === theme.value ? 'border-foreground bg-accent/30' : 'border-border'}"
						>
							<span
								class="absolute top-3 left-3 flex size-4 items-center justify-center rounded-full border-2
									{selectedTheme === theme.value ? 'border-foreground' : 'border-muted-foreground'}"
							>
								{#if selectedTheme === theme.value}
									<span class="size-2 rounded-full bg-foreground"></span>
								{/if}
							</span>
							<div class="mt-3 flex items-center justify-center text-foreground">
								{#if theme.value === 'system'}
									<DeviceDesktop2 size={22} />
								{:else if theme.value === 'light'}
									<Sun size={22} />
								{:else}
									<Moon size={22} />
								{/if}
							</div>
							<span class="font-medium">{theme.label}</span>
						</button>
					{/each}
				</div>
			{/if}
		</section>

		<!-- Gallery -->
		<section class="flex flex-col gap-3">
			<h3 class="text-xs font-medium">Gallery</h3>
			{#if business === null}
				<Skeleton class="min-h-40 rounded-lg" />
			{:else if gallaryPhotosUrls.length > 0}
				<div class="grid grid-cols-3 gap-2 rounded-lg border p-2">
					{#each gallaryPhotosUrls as url (url)}
						<div class="group relative">
							<img src={url} alt="Gallery" class="aspect-square w-full rounded-md object-cover" />
							<button
								type="button"
								onclick={() => removePhoto(url)}
								class="absolute top-1 right-1 hidden size-5 items-center justify-center rounded-full bg-black/60 text-white group-hover:flex"
								aria-label="Remove photo"
							>
								<svg
									viewBox="0 0 12 12"
									class="size-3"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
								>
									<path d="M2 2l8 8M10 2l-8 8" />
								</svg>
							</button>
						</div>
					{/each}
				</div>
			{:else}
				<div
					class="flex min-h-40 flex-col items-center justify-center gap-3 rounded-lg border border-dashed bg-muted/30"
				>
					<Button variant="outline" size="sm">
						<Photo size={14} />
						Upload photos
					</Button>
				</div>
			{/if}
			<p class="text-center text-xs text-muted-foreground">
				Up to 10 MB size per image. Max 10 photos per upload.
			</p>
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
					{#if business === null}
						<Skeleton class="h-3 w-24 rounded" />
					{:else}
						<span class="font-medium text-foreground">{business.slug || 'your-slug'}</span>
					{/if}
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
