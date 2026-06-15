<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import CircleHalf from '@tabler/icons-svelte/icons/circle-half';
	import DeviceTablet from '@tabler/icons-svelte/icons/device-tablet';
	import DeviceDesktop from '@tabler/icons-svelte/icons/device-desktop';
	import Plus from '@tabler/icons-svelte/icons/plus';
	import BrandTiktok from '@tabler/icons-svelte/icons/brand-tiktok';
	import BrandX from '@tabler/icons-svelte/icons/brand-x';
	import BrandYoutube from '@tabler/icons-svelte/icons/brand-youtube';
	import BrandLinkedin from '@tabler/icons-svelte/icons/brand-linkedin';
	import Link from '@tabler/icons-svelte/icons/link';
	import { businessStore } from '../../../core/store/business.svelte';
	import { createMutation } from '@tanstack/svelte-query';
	import { updateBusinessLinks } from '../../../api/business/update.business.links.mutation';
	import type {
		BusinessUpdateLinksInput,
		BusinessUpdateLinksResult
	} from '../../../api/business/models/business-model';
	import type { BaseErrorResponse } from '@pikslots/shared';
	import type { AxiosError } from 'axios';
	import { toast } from 'svelte-sonner';

	type LinkType = 'tiktok' | 'x' | 'youtube' | 'linkedin' | 'custom';

	const LINK_OPTIONS: { type: LinkType; label: string; icon: any }[] = [
		{ type: 'tiktok', label: 'TikTok', icon: BrandTiktok },
		{ type: 'x', label: 'X', icon: BrandX },
		{ type: 'youtube', label: 'YouTube', icon: BrandYoutube },
		{ type: 'linkedin', label: 'LinkedIn', icon: BrandLinkedin },
		{ type: 'custom', label: 'Custom link', icon: Link }
	];

	const business = $derived(businessStore.selectedBusiness);

	let website = $state('');
	let instagram = $state('');
	let facebook = $state('');
	let tiktok = $state('');
	let x = $state('');
	let youtube = $state('');
	let linkedin = $state('');
	let extraLinks = $state<{ type: LinkType; label: string; icon: any; value: string }[]>([]);
	let previewDevice = $state<'tablet' | 'desktop'>('tablet');

	$effect(() => {
		if (business) {
			website = business.businessLinks.Website ?? '';
			instagram = business.businessLinks.Instagram ?? '';
			facebook = business.businessLinks.Facebook ?? '';
			tiktok = business.businessLinks.Tiktok ?? '';
			x = business.businessLinks.X ?? '';
			youtube = business.businessLinks.Youtube ?? '';
			linkedin = business.businessLinks.LinkedIn ?? '';
			// Populate extra links for non-empty optional platforms
			const extras: typeof extraLinks = [];
			if (tiktok)
				extras.push({ type: 'tiktok', label: 'TikTok', icon: BrandTiktok, value: tiktok });
			if (x) extras.push({ type: 'x', label: 'X', icon: BrandX, value: x });
			if (youtube)
				extras.push({ type: 'youtube', label: 'YouTube', icon: BrandYoutube, value: youtube });
			if (linkedin)
				extras.push({ type: 'linkedin', label: 'LinkedIn', icon: BrandLinkedin, value: linkedin });
			extraLinks = extras;
		}
	});

	const isDirty = $derived(
		!!business &&
			(website !== (business.businessLinks.Website ?? '') ||
				instagram !== (business.businessLinks.Instagram ?? '') ||
				facebook !== (business.businessLinks.Facebook ?? '') ||
				extraLinks.some((l) => {
					if (l.type === 'tiktok') return l.value !== (business.businessLinks.Tiktok ?? '');
					if (l.type === 'x') return l.value !== (business.businessLinks.X ?? '');
					if (l.type === 'youtube') return l.value !== (business.businessLinks.Youtube ?? '');
					if (l.type === 'linkedin') return l.value !== (business.businessLinks.LinkedIn ?? '');
					return false;
				}))
	);

	const updateMutation = createMutation<
		BusinessUpdateLinksResult,
		AxiosError<BaseErrorResponse>,
		BusinessUpdateLinksInput
	>(() => ({
		mutationFn: updateBusinessLinks
	}));

	$effect(() => {
		if (updateMutation.data) {
			businessStore.setSelectedBusiness(updateMutation.data);
			toast.success('Links saved successfully.');
		}
		if (updateMutation.isError) {
			toast.error(
				updateMutation.error?.response?.data?.message ?? 'Failed to save. Please try again.'
			);
		}
	});

	function getExtraValue(type: LinkType): string {
		return extraLinks.find((l) => l.type === type)?.value ?? '';
	}

	function handleSave() {
		if (!business) return;
		updateMutation.mutate({
			id: business.id,
			Website: website,
			Instagram: instagram,
			Facebook: facebook,
			Tiktok: getExtraValue('tiktok'),
			X: getExtraValue('x'),
			Youtube: getExtraValue('youtube'),
			LinkedIn: getExtraValue('linkedin')
		});
	}

	function handleCancel() {
		if (!business) return;
		website = business.businessLinks.Website ?? '';
		instagram = business.businessLinks.Instagram ?? '';
		facebook = business.businessLinks.Facebook ?? '';
		tiktok = business.businessLinks.Tiktok ?? '';
		x = business.businessLinks.X ?? '';
		youtube = business.businessLinks.Youtube ?? '';
		linkedin = business.businessLinks.LinkedIn ?? '';
		const extras: typeof extraLinks = [];
		if (tiktok) extras.push({ type: 'tiktok', label: 'TikTok', icon: BrandTiktok, value: tiktok });
		if (x) extras.push({ type: 'x', label: 'X', icon: BrandX, value: x });
		if (youtube)
			extras.push({ type: 'youtube', label: 'YouTube', icon: BrandYoutube, value: youtube });
		if (linkedin)
			extras.push({ type: 'linkedin', label: 'LinkedIn', icon: BrandLinkedin, value: linkedin });
		extraLinks = extras;
	}

	function addLink(option: (typeof LINK_OPTIONS)[number]) {
		if (extraLinks.some((l) => l.type === option.type)) return;
		extraLinks = [...extraLinks, { ...option, value: '' }];
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
				<h2 class="text-xs font-semibold">Your links</h2>
				<p class="text-xs text-muted-foreground">
					Drive Booking Page visitors to your site, socials and more.
				</p>
			</div>

			<div class="flex flex-col gap-2">
				<Label for="website">Website</Label>
				<Input id="website" type="url" bind:value={website} placeholder="" />
			</div>

			<div class="flex flex-col gap-2">
				<Label for="instagram">Instagram</Label>
				<Input id="instagram" type="url" bind:value={instagram} placeholder="" />
			</div>

			<div class="flex flex-col gap-2">
				<Label for="facebook">Facebook</Label>
				<Input id="facebook" type="url" bind:value={facebook} placeholder="" />
			</div>

			{#each extraLinks as link, i (link.type)}
				<div class="flex flex-col gap-2">
					<Label class="flex items-center gap-1.5">
						<link.icon size={13} class="text-muted-foreground" />
						{link.label}
					</Label>
					<Input type="url" bind:value={link.value} placeholder="" />
				</div>
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
					{#each LINK_OPTIONS.filter((o) => !extraLinks.some((l) => l.type === o.type)) as option (option.type)}
						<DropdownMenu.Item class="flex items-center gap-2" onclick={() => addLink(option)}>
							<option.icon size={15} class="text-muted-foreground" />
							{option.label}
						</DropdownMenu.Item>
					{/each}
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
