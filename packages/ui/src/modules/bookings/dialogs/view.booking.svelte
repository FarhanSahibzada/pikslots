<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import Clock from '@tabler/icons-svelte/icons/clock';
	import Users from '@tabler/icons-svelte/icons/users';
	import User from '@tabler/icons-svelte/icons/user';
	import InfoCircle from '@tabler/icons-svelte/icons/info-circle';
	import Circle from '@tabler/icons-svelte/icons/circle-filled';
	import ChevronDown from '@tabler/icons-svelte/icons/chevron-down';

	export type BookingEvent = {
		id: string;
		title: string;
		start: Date;
		end: Date;
		durationMins: number;
		host: string;
		guests: { name: string; deleted?: boolean }[];
		bookingId: string;
		source: string;
		color?: string;
	};

	let { open = $bindable(false), booking }: { open: boolean; booking: BookingEvent | null } =
		$props();

	function formatDate(date: Date) {
		return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
	}

	function formatTime(date: Date) {
		return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="w-[420px] gap-0 p-0">
		<!-- Header -->
		<Dialog.Header class="flex flex-row items-center justify-between border-b px-5 py-4">
			<Dialog.Title class="text-base font-semibold">Appointment</Dialog.Title>
		</Dialog.Header>

		{#if booking}
			<!-- Tabs row -->
			<div class="flex items-center justify-between border-b px-5">
				<Tabs.Root value="details" class="w-full">
					<div class="flex items-center justify-between">
						<Tabs.List class="h-auto gap-0 rounded-none bg-transparent p-0">
							<Tabs.Trigger
								value="details"
								class="rounded-none border-b-2 border-transparent px-0 pb-2.5 pt-2 text-sm data-[state=active]:border-foreground data-[state=active]:shadow-none"
							>
								Details
							</Tabs.Trigger>
							<Tabs.Trigger
								value="history"
								class="ml-4 rounded-none border-b-2 border-transparent px-0 pb-2.5 pt-2 text-sm data-[state=active]:border-foreground data-[state=active]:shadow-none"
							>
								History
							</Tabs.Trigger>
						</Tabs.List>
						<button class="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
							No label
							<ChevronDown size={12} />
						</button>
					</div>

					<!-- Details tab -->
					<Tabs.Content value="details" class="mt-0 px-0">
						<div class="flex flex-col gap-4 py-4">
							<!-- Service -->
							<div class="flex items-start gap-3">
								<Circle size={14} class="mt-0.5 shrink-0" style="color: {booking.color ?? '#0d9488'}" />
								<div class="flex flex-col">
									<span class="text-sm font-medium">{booking.title}</span>
									<span class="text-xs text-muted-foreground">
										Duration: <span class="font-medium text-foreground">{booking.durationMins}</span> mins
									</span>
								</div>
							</div>

							<Separator />

							<!-- Date & time -->
							<div class="flex items-center gap-3">
								<Clock size={16} class="shrink-0 text-muted-foreground" />
								<div class="flex items-center gap-2 text-sm">
									<span>{formatDate(booking.start)}</span>
									<span class="text-muted-foreground">{formatTime(booking.start)}</span>
									<span class="text-muted-foreground">—</span>
									<span class="text-muted-foreground">{formatTime(booking.end)}</span>
								</div>
							</div>

							<Separator />

							<!-- Guests -->
							<div class="flex items-start gap-3">
								<Users size={16} class="mt-0.5 shrink-0 text-muted-foreground" />
								<div class="flex flex-col gap-1.5">
									<span class="text-sm">{booking.guests.length} guest{booking.guests.length !== 1 ? 's' : ''}</span>
									{#each booking.guests as guest}
										<div class="flex items-center gap-2">
											<div class="flex size-6 items-center justify-center rounded-full bg-muted">
												<User size={12} class="text-muted-foreground" />
											</div>
											<span class="text-sm">{guest.name}</span>
											{#if guest.deleted}
												<Badge variant="secondary" class="h-5 px-1.5 text-[10px]">Deleted</Badge>
											{/if}
										</div>
									{/each}
								</div>
							</div>

							<Separator />

							<!-- Host -->
							<div class="flex items-center gap-3">
								<Avatar.Root class="size-6 text-[10px]">
									<Avatar.Fallback class="bg-primary text-[10px] text-primary-foreground">
										{booking.host[0]}
									</Avatar.Fallback>
								</Avatar.Root>
								<span class="text-sm">{booking.host}</span>
							</div>

							<Separator />

							<!-- Booking info -->
							<div class="flex items-start gap-3">
								<InfoCircle size={16} class="mt-0.5 shrink-0 text-muted-foreground" />
								<div class="flex flex-col">
									<span class="text-sm">{booking.source}</span>
									<span class="text-xs text-muted-foreground">Booking ID: {booking.bookingId}</span>
								</div>
							</div>
						</div>
					</Tabs.Content>

					<!-- History tab -->
					<Tabs.Content value="history" class="mt-0 px-0">
						<div class="flex items-center justify-center py-10 text-sm text-muted-foreground">
							No history available
						</div>
					</Tabs.Content>
				</Tabs.Root>
			</div>

			<!-- Footer -->
			<div class="flex justify-end border-t px-5 py-3">
				<Button variant="ghost" class="text-destructive hover:text-destructive">Delete</Button>
			</div>
		{/if}
	</Dialog.Content>
</Dialog.Root>
