<script lang="ts">
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import { Switch } from '$lib/components/ui/switch/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import Pencil from '@tabler/icons-svelte/icons/pencil';
	import Phone from '@tabler/icons-svelte/icons/phone';
	import Mail from '@tabler/icons-svelte/icons/mail';
	import Clock from '@tabler/icons-svelte/icons/clock';
	import Qrcode from '@tabler/icons-svelte/icons/qrcode';
	import Lock from '@tabler/icons-svelte/icons/lock';
	import ChevronDown from '@tabler/icons-svelte/icons/chevron-down';
	import Copy from '@tabler/icons-svelte/icons/copy';
	import Plus from '@tabler/icons-svelte/icons/plus';
	import Trash from '@tabler/icons-svelte/icons/trash';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import { createQuery } from '@tanstack/svelte-query';
	import { getUserProfileQueryOptions } from '../../../../api/user/get.user.profile.query';

	const userQuery = createQuery(() => getUserProfileQueryOptions());

	function currentTime(): string {
		return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	}

	let time = $state(currentTime());

	// ── Working hours ──────────────────────────────────────────────
	const workingHoursTimes = [
		'12:00 AM', '12:30 AM', '1:00 AM', '1:30 AM', '2:00 AM', '2:30 AM',
		'3:00 AM', '3:30 AM', '4:00 AM', '4:30 AM', '5:00 AM', '5:30 AM',
		'6:00 AM', '6:30 AM', '7:00 AM', '7:30 AM', '8:00 AM', '8:30 AM',
		'9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
		'12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
		'3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM',
		'6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM',
		'9:00 PM', '9:30 PM', '10:00 PM', '10:30 PM', '11:00 PM', '11:30 PM'
	];

	type DaySchedule = { label: string; enabled: boolean; start: string; end: string };

	let days = $state<DaySchedule[]>([
		{ label: 'Monday', enabled: true, start: '9:00 AM', end: '5:00 PM' },
		{ label: 'Tuesday', enabled: true, start: '9:00 AM', end: '5:00 PM' },
		{ label: 'Wednesday', enabled: true, start: '9:00 AM', end: '5:00 PM' },
		{ label: 'Thursday', enabled: true, start: '9:00 AM', end: '5:00 PM' },
		{ label: 'Friday', enabled: true, start: '9:00 AM', end: '5:00 PM' },
		{ label: 'Saturday', enabled: false, start: '9:00 AM', end: '5:00 PM' },
		{ label: 'Sunday', enabled: false, start: '9:00 AM', end: '5:00 PM' }
	]);

	function copyToAll(index: number) {
		const source = days[index];
		days = days.map((d, i) => (i === index ? d : { ...d, start: source.start, end: source.end }));
	}

	// ── Breaks ─────────────────────────────────────────────────────
	const breakTimes = [
		'12:00 AM', '12:15 AM', '12:30 AM', '12:45 AM',
		'1:00 AM', '1:15 AM', '1:30 AM', '1:45 AM',
		'2:00 AM', '2:15 AM', '2:30 AM', '2:45 AM',
		'3:00 AM', '3:15 AM', '3:30 AM', '3:45 AM',
		'4:00 AM', '4:15 AM', '4:30 AM', '4:45 AM',
		'5:00 AM', '5:15 AM', '5:30 AM', '5:45 AM',
		'6:00 AM', '6:15 AM', '6:30 AM', '6:45 AM',
		'7:00 AM', '7:15 AM', '7:30 AM', '7:45 AM',
		'8:00 AM', '8:15 AM', '8:30 AM', '8:45 AM',
		'9:00 AM', '9:15 AM', '9:30 AM', '9:45 AM',
		'10:00 AM', '10:15 AM', '10:30 AM', '10:45 AM',
		'11:00 AM', '11:15 AM', '11:30 AM', '11:45 AM',
		'12:00 PM', '12:15 PM', '12:30 PM', '12:45 PM',
		'1:00 PM', '1:15 PM', '1:30 PM', '1:45 PM',
		'2:00 PM', '2:15 PM', '2:30 PM', '2:45 PM',
		'3:00 PM', '3:15 PM', '3:30 PM', '3:45 PM',
		'4:00 PM', '4:15 PM', '4:30 PM', '4:45 PM',
		'5:00 PM', '5:15 PM', '5:30 PM', '5:45 PM',
		'6:00 PM', '6:15 PM', '6:30 PM', '6:45 PM',
		'7:00 PM', '7:15 PM', '7:30 PM', '7:45 PM',
		'8:00 PM', '8:15 PM', '8:30 PM', '8:45 PM',
		'9:00 PM', '9:15 PM', '9:30 PM', '9:45 PM',
		'10:00 PM', '10:15 PM', '10:30 PM', '10:45 PM',
		'11:00 PM', '11:15 PM', '11:30 PM', '11:45 PM'
	];

	type Break = { start: string; end: string };
	type DayBreaks = { label: string; workday: boolean; enabled: boolean; breaks: Break[] };

	let breakDays = $state<DayBreaks[]>([
		{
			label: 'Monday',
			workday: true,
			enabled: true,
			breaks: [
				{ start: '9:00 AM', end: '9:15 AM' },
				{ start: '9:00 AM', end: '9:15 AM' }
			]
		},
		{ label: 'Tuesday', workday: true, enabled: false, breaks: [] },
		{ label: 'Wednesday', workday: true, enabled: false, breaks: [] },
		{ label: 'Thursday', workday: true, enabled: false, breaks: [] },
		{ label: 'Friday', workday: true, enabled: false, breaks: [] },
		{ label: 'Saturday', workday: false, enabled: false, breaks: [] },
		{ label: 'Sunday', workday: false, enabled: false, breaks: [] }
	]);

	function addBreak(dayIndex: number) {
		breakDays[dayIndex].breaks.push({ start: '9:00 AM', end: '9:15 AM' });
	}

	function removeBreak(dayIndex: number, breakIndex: number) {
		breakDays[dayIndex].breaks.splice(breakIndex, 1);
	}

	// ── Time off ───────────────────────────────────────────────────
	type TimeOff = { id: number; title: string; date: string; days: number };

	let timeoffs = $state<TimeOff[]>([{ id: 1, title: 'Eid holiday', date: '21 May 2026', days: 1 }]);
	let hoveredId = $state<number | null>(null);

	function removeTimeOff(id: number) {
		timeoffs = timeoffs.filter((t) => t.id !== id);
	}
</script>

<div class="flex flex-col">
	<!-- Profile header -->
	<div class="relative flex items-center gap-4 px-6 py-5">
		{#if userQuery.isLoading}
			<Skeleton class="size-16 rounded-full" />
			<div class="flex flex-col gap-1.5">
				<Skeleton class="h-4 w-32" />
				<Skeleton class="h-3 w-48" />
			</div>
		{:else if userQuery.data}
			{@const fullName = `${userQuery.data.name.firstName} ${userQuery.data.name.lastName}`}
			{@const initials = `${userQuery.data.name.firstName[0]}${userQuery.data.name.lastName[0]}`}
			<Avatar.Root class="size-16 text-lg">
				<Avatar.Image src={userQuery.data.avatarUrl ?? ''} alt={fullName} />
				<Avatar.Fallback class="bg-muted font-semibold text-foreground">
					{initials}
				</Avatar.Fallback>
			</Avatar.Root>
			<div class="flex flex-col gap-0.5">
				<span class="text-base font-semibold">{fullName}</span>
				<span class="text-xs text-muted-foreground">{time}</span>
			</div>
			<Button variant="ghost" size="icon-sm" class="absolute top-4 right-4">
				<Pencil size={16} />
			</Button>
		{/if}
	</div>

	<!-- Tabs -->
	<Tabs.Root value="about" class="flex flex-col">
		<Tabs.List class="h-auto justify-start rounded-none border-b bg-transparent px-6 pb-0">
			<Tabs.Trigger
				value="about"
				class="cursor-pointer rounded-none border-b-2 border-transparent px-3 pb-2 pt-0 data-[state=active]:border-b-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
			>
				About
			</Tabs.Trigger>
			<Tabs.Trigger
				value="integrations"
				class="cursor-pointer rounded-none border-b-2 border-transparent px-3 pb-2 pt-0 data-[state=active]:border-b-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
			>
				Integrations
			</Tabs.Trigger>
			<Tabs.Trigger
				value="services"
				class="cursor-pointer rounded-none border-b-2 border-transparent px-3 pb-2 pt-0 data-[state=active]:border-b-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
			>
				Services
			</Tabs.Trigger>
			<Tabs.Trigger
				value="working-hours"
				class="cursor-pointer rounded-none border-b-2 border-transparent px-3 pb-2 pt-0 data-[state=active]:border-b-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
			>
				Working hours
			</Tabs.Trigger>
			<Tabs.Trigger
				value="breaks"
				class="cursor-pointer rounded-none border-b-2 border-transparent px-3 pb-2 pt-0 data-[state=active]:border-b-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
			>
				Breaks
			</Tabs.Trigger>
			<Tabs.Trigger
				value="time-off"
				class="cursor-pointer rounded-none border-b-2 border-transparent px-3 pb-2 pt-0 data-[state=active]:border-b-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
			>
				Time off
			</Tabs.Trigger>
			<Tabs.Trigger
				value="updates"
				class="cursor-pointer rounded-none border-b-2 border-transparent px-3 pb-2 pt-0 data-[state=active]:border-b-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
			>
				Updates
			</Tabs.Trigger>
		</Tabs.List>

		<!-- About -->
		<Tabs.Content value="about" class="mt-0">
			<div class="flex flex-col px-6">
				{#if userQuery.isLoading}
					<div class="flex flex-col gap-3 pt-4">
						{#each Array(4) as _}
							<Skeleton class="h-4 w-56" />
						{/each}
					</div>
				{:else if userQuery.data}
					<!-- Phone -->
					<div class="flex items-center gap-3 pt-4 pb-2">
						<Phone size={16} class="shrink-0 text-muted-foreground" />
						<span class="text-xs">{userQuery.data.phone ?? '—'}</span>
					</div>

					<!-- Email -->
					<div class="flex items-center gap-3 py-2">
						<Mail size={16} class="shrink-0 text-muted-foreground" />
						<span class="text-xs">{userQuery.data.email}</span>
					</div>

					<!-- Hours today -->
					<div class="flex items-center gap-3 py-2">
						<Clock size={16} class="shrink-0 text-muted-foreground" />
						<span class="text-xs">
							Today &bull; Closed
						</span>
						<div class="ml-1 flex items-center gap-1">
							<Button variant="ghost" size="icon-sm" class="size-6">
								<ChevronDown size={14} />
							</Button>
							<Button variant="ghost" size="icon-sm" class="size-6">
								<Pencil size={13} />
							</Button>
						</div>
					</div>

					<!-- Booking URL -->
					<div class="flex items-center gap-3 py-2">
						<Qrcode size={16} class="shrink-0 text-muted-foreground" />
						<a
							href={userQuery.data.bookingUrl}
							target="_blank"
							rel="noopener noreferrer"
							class="text-xs underline underline-offset-2"
						>
							{userQuery.data.bookingUrl}
						</a>
						<Button variant="ghost" size="icon-sm" class="size-6">
							<Pencil size={13} />
						</Button>
					</div>

					<!-- Role -->
					<div class="flex items-center gap-3 py-2">
						<Lock size={16} class="shrink-0 text-muted-foreground" />
						<button
							type="button"
							disabled
							class="flex cursor-not-allowed items-center gap-1 text-xs text-muted-foreground"
						>
							{userQuery.data.role}
							<ChevronDown size={14} />
						</button>
					</div>
				{/if}
			</div>
		</Tabs.Content>

		<!-- Integrations -->
		<Tabs.Content value="integrations" class="mt-0 px-6 pt-4">
			<p class="text-xs text-muted-foreground">No integrations configured.</p>
		</Tabs.Content>

		<!-- Services -->
		<Tabs.Content value="services" class="mt-0 px-6 pt-4">
			<p class="text-xs text-muted-foreground">No services configured.</p>
		</Tabs.Content>

		<!-- Working hours -->
		<Tabs.Content value="working-hours" class="mt-0">
			<div class="w-[60%] flex flex-col px-6">
				<p class="pt-4 pb-2 text-xs text-muted-foreground">
					What days and hours does your business operate? This determines your business availability.
				</p>
				<div class="flex flex-col divide-y divide-border/90">
					{#each days as day, i (day.label)}
						<div class="flex items-center gap-4 py-2">
							<Switch bind:checked={day.enabled} />
							<span class="w-28 text-xs font-medium">{day.label}</span>

							{#if day.enabled}
								<Select.Root type="single" bind:value={day.start}>
									<Select.Trigger class="w-28 text-xs">
										{day.start}
									</Select.Trigger>
									<Select.Content class="max-h-60 overflow-y-auto">
										{#each workingHoursTimes as t (t)}
											<Select.Item value={t}>{t}</Select.Item>
										{/each}
									</Select.Content>
								</Select.Root>

								<span class="text-muted-foreground">—</span>

								<Select.Root type="single" bind:value={day.end}>
									<Select.Trigger class="w-28 text-xs">
										{day.end}
									</Select.Trigger>
									<Select.Content class="max-h-60 overflow-y-auto">
										{#each workingHoursTimes as t (t)}
											<Select.Item value={t}>{t}</Select.Item>
										{/each}
									</Select.Content>
								</Select.Root>

								{#if i === 0}
									<Button
										variant="ghost"
										size="icon-sm"
										onclick={() => copyToAll(i)}
										title="Copy hours to all days"
										class="ml-auto"
									>
										<Copy size={15} />
									</Button>
								{/if}
							{:else}
								<span class="ml-auto rounded-md bg-muted px-3 py-1 text-xs text-muted-foreground">
									Day off
								</span>
							{/if}
						</div>
					{/each}
				</div>

				<div class="flex items-center justify-end gap-2 py-4">
					<Button variant="ghost">Cancel</Button>
					<Button>Save</Button>
				</div>
			</div>
		</Tabs.Content>

		<!-- Breaks -->
		<Tabs.Content value="breaks" class="mt-0">
			<div class="w-[60%] flex flex-col px-6">
				<div class="flex flex-col divide-y divide-border/90 pt-4 pb-2">
					{#each breakDays as day, di (day.label)}
						<div class="flex flex-col py-2">
							<div class="flex items-center gap-4">
								<Switch
									bind:checked={day.enabled}
									disabled={!day.workday}
									class={!day.workday ? 'opacity-40' : ''}
								/>

								<span class="w-28 text-xs font-medium {!day.workday ? 'text-muted-foreground' : ''}">
									{day.label}
								</span>

								{#if !day.workday}
									<span class="ml-auto text-xs text-muted-foreground">Day off</span>
								{:else if day.enabled && day.breaks.length === 0}
									<span class="ml-auto text-xs text-muted-foreground">No breaks</span>
									<Button variant="ghost" size="icon-sm" onclick={() => addBreak(di)} class="ml-2">
										<Plus size={14} />
									</Button>
								{:else if !day.enabled}
									<span class="ml-auto text-xs text-muted-foreground">No breaks</span>
								{/if}
							</div>

							{#if day.enabled && day.breaks.length > 0}
								<div class="mt-1 flex flex-col gap-1 pl-[calc(1.25rem+1rem+7rem)]">
									{#each day.breaks as brk, bi (bi)}
										<div class="flex items-center gap-2">
											<Select.Root type="single" bind:value={brk.start}>
												<Select.Trigger class="w-28 text-xs">
													{brk.start}
												</Select.Trigger>
												<Select.Content class="max-h-60 overflow-y-auto">
													{#each breakTimes as t (t)}
														<Select.Item value={t}>{t}</Select.Item>
													{/each}
												</Select.Content>
											</Select.Root>

											<span class="text-muted-foreground">—</span>

											<Select.Root type="single" bind:value={brk.end}>
												<Select.Trigger class="w-28 text-xs">
													{brk.end}
												</Select.Trigger>
												<Select.Content class="max-h-60 overflow-y-auto">
													{#each breakTimes as t (t)}
														<Select.Item value={t}>{t}</Select.Item>
													{/each}
												</Select.Content>
											</Select.Root>

											{#if bi === day.breaks.length - 1}
												<Button variant="ghost" size="icon-sm" onclick={() => addBreak(di)}>
													<Plus size={14} />
												</Button>
											{:else}
												<Button
													variant="ghost"
													size="icon-sm"
													onclick={() => removeBreak(di, bi)}
													class="text-muted-foreground hover:text-destructive"
												>
													<Trash size={14} />
												</Button>
											{/if}
										</div>
									{/each}
								</div>
							{/if}
						</div>
					{/each}
				</div>

				<div class="flex items-center justify-end gap-2 py-2">
					<Button variant="ghost">Cancel</Button>
					<Button>Save</Button>
				</div>
			</div>
		</Tabs.Content>

		<!-- Time off -->
		<Tabs.Content value="time-off" class="mt-0">
			<div class="w-[60%] flex flex-col px-6">
				<div class="pt-4 pb-2">
					<Button variant="link" class="h-auto gap-1.5 p-0 text-xs font-medium">
						<Plus size={14} />
						Add time off
					</Button>
				</div>

				<div class="flex flex-col divide-y divide-border/90">
					{#each timeoffs as entry (entry.id)}
						<div
							class="flex items-center justify-between py-3"
							onmouseenter={() => (hoveredId = entry.id)}
							onmouseleave={() => (hoveredId = null)}
						>
							<div class="flex flex-col gap-0.5">
								<span class="text-xs font-medium">{entry.title}</span>
								<span class="text-xs text-muted-foreground">{entry.date}</span>
							</div>

							<div class="flex items-center gap-2">
								{#if hoveredId === entry.id}
									<Button variant="ghost" size="icon-sm">
										<Pencil size={14} />
									</Button>
									<Button
										variant="ghost"
										size="icon-sm"
										onclick={() => removeTimeOff(entry.id)}
										class="text-muted-foreground hover:text-destructive"
									>
										<Trash size={14} />
									</Button>
								{:else}
									<span class="text-xs text-muted-foreground">
										{entry.days}
										{entry.days === 1 ? 'Day' : 'Days'}
									</span>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			</div>
		</Tabs.Content>

		<!-- Updates -->
		<Tabs.Content value="updates" class="mt-0 px-6 pt-4">
			<p class="text-xs text-muted-foreground">No updates.</p>
		</Tabs.Content>
	</Tabs.Root>
</div>
