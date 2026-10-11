<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import Phone from '@tabler/icons-svelte/icons/phone';
	import Mail from '@tabler/icons-svelte/icons/mail';
	import Clock from '@tabler/icons-svelte/icons/clock';
	import Qrcode from '@tabler/icons-svelte/icons/qrcode';
	import Lock from '@tabler/icons-svelte/icons/lock';
	import ChevronDown from '@tabler/icons-svelte/icons/chevron-down';
	import ChevronUp from '@tabler/icons-svelte/icons/chevron-up';
	import type { UserSummary, UserWorkingHoursResponse } from '@pikslots/shared';
	import { WEEKDAYS, fromHHmm } from '$utils/working-hours';

	let { user, isLoading }: { user: UserSummary | undefined; isLoading: boolean } = $props();

	let hoursOpen = $state(false);

	const todayKey = $derived(
		new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
	);

	const todayHours = $derived(user?.userWorkingHours?.[todayKey as keyof UserWorkingHoursResponse]);

	const todayLabel = $derived.by(() => {
		if (!todayHours?.enabled) return 'Closed';
		return `${fromHHmm(todayHours.openTime)} – ${fromHHmm(todayHours.closeTime)}`;
	});
</script>

<div class="flex flex-col px-6">
	{#if isLoading}
		<div class="flex flex-col gap-3 pt-4">
			{#each Array(4) as _, i (i)}
				<Skeleton class="h-4 w-56" />
			{/each}
		</div>
	{:else if user}
		<!-- Phone -->
		<div class="flex items-center gap-3 pt-4 pb-2">
			<Phone size={16} class="shrink-0 text-muted-foreground" />
			<span class="text-xs">{user.phone ?? '—'}</span>
		</div>

		<!-- Email -->
		<div class="flex items-center gap-3 py-2">
			<Mail size={16} class="shrink-0 text-muted-foreground" />
			<span class="text-xs">{user.email}</span>
		</div>

		<!-- Hours today -->
		<div class="flex items-center gap-3 py-2">
			<Clock size={16} class="shrink-0 text-muted-foreground" />
			<span class="text-xs"> Today &bull; {todayLabel} </span>
			<div class="ml-1 flex items-center gap-1">
				<Button
					variant="ghost"
					size="icon-sm"
					class="size-6"
					onclick={() => (hoursOpen = !hoursOpen)}
				>
					{#if hoursOpen}
						<ChevronUp size={14} />
					{:else}
						<ChevronDown size={14} />
					{/if}
				</Button>
			</div>
		</div>

		{#if hoursOpen}
			<div class="flex flex-col gap-1 py-1 pl-7">
				{#each WEEKDAYS as day (day)}
					{@const dayHours = user?.userWorkingHours?.[day]}
					<div class="flex items-center gap-2 text-xs text-muted-foreground">
						<span class="w-24 shrink-0 capitalize">{day}</span>
						{#if dayHours?.enabled}
							<span>{fromHHmm(dayHours.openTime)} – {fromHHmm(dayHours.closeTime)}</span>
						{:else}
							<span class="rounded-md bg-muted px-2 py-0.5">Day off</span>
						{/if}
					</div>
				{/each}
			</div>
		{/if}

		<!-- Booking URL -->
		<div class="flex items-center gap-3 py-2">
			<Qrcode size={16} class="shrink-0 text-muted-foreground" />
			<a
				href={user.bookingUrl}
				target="_blank"
				rel="noopener noreferrer external"
				class="text-xs underline underline-offset-2"
			>
				{user.bookingUrl}
			</a>
			<!-- <Button variant="ghost" size="icon-sm" class="size-6">
				<Pencil size={13} />
			</Button> -->
		</div>

		<!-- Role -->
		<div class="flex items-center gap-3 py-2">
			<Lock size={16} class="shrink-0 text-muted-foreground" />
			<button
				type="button"
				disabled
				class="flex cursor-not-allowed items-center gap-1 text-xs text-muted-foreground"
			>
				{user.role}
				<ChevronDown size={14} />
			</button>
		</div>
	{/if}
</div>
