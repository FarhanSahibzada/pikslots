<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { createMutation, useQueryClient } from '@tanstack/svelte-query';
	import { toast } from 'svelte-sonner';
	import axios from 'axios';
	import { deleteBookingMutationOptions } from '../../api/booking/delete.booking.mutation';
	import Clock from '@tabler/icons-svelte/icons/clock';
	import Users from '@tabler/icons-svelte/icons/users';
	import User from '@tabler/icons-svelte/icons/user';
	import InfoCircle from '@tabler/icons-svelte/icons/info-circle';
	import CalendarIcon from '@tabler/icons-svelte/icons/calendar';
	import Circle from '@tabler/icons-svelte/icons/circle-filled';
	import { formatIsoInTimezone } from '@pikslots/datetime';
	import { businessStore } from '$stores/business.svelte';
	import Note from '@tabler/icons-svelte/icons/message';
	import EditBookingDialog from './edit.booking.svelte';

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
		label?: string;
		notes?: string;
		serviceId: string;
		customerId: string;
		userId: string;
		bookingDate: string;
		serviceSnapshot: {
			title: string;
			durationInMins: number;
			cost: number;
			colorCode: string;
		};
	};

	const LABEL_COLORS: Record<string, string> = {
		Confirmed: '#22c55e',
		Pending: '#f59e0b',
		Cancelled: '#ef4444',
		Completed: '#3b82f6',
		'No Show': '#a855f7'
	};

	let {
		open = $bindable(false),
		booking,
		selectedUserRole,
		selectedUserId
	}: {
		open: boolean;
		booking: BookingEvent | null;
		selectedUserRole: string;
		selectedUserId: string;
	} = $props();

	let editDialogOpen = $state(false);

	const businessTimezone = $derived(
		businessStore.selectedBusiness?.locationDetails?.timeZone || 'UTC'
	);

	const queryClient = useQueryClient();
	const deleteMutation = createMutation(deleteBookingMutationOptions);

	$effect(() => {
		if (deleteMutation.isSuccess) {
			queryClient.invalidateQueries({ queryKey: ['bookings-by-business-for-user'] });
			toast.success('Booking deleted successfully');
			open = false;
			deleteMutation.reset();
		}

		if (deleteMutation.isError) {
			const error = deleteMutation.error;
			if (axios.isAxiosError(error)) {
				toast.error(error?.response?.data?.message ?? 'Failed to delete booking');
			} else {
				toast.error('Failed to delete booking');
			}
		}
	});

	function onDelete() {
		if (!booking) return;
		deleteMutation.mutate(booking.id);
	}

	function formatDate(date: Date) {
		return formatIsoInTimezone(date.toISOString(), businessTimezone, 'EEE, d MMM');
	}

	function formatTime(date: Date) {
		return formatIsoInTimezone(date.toISOString(), businessTimezone, 'h:mm a');
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="flex h-140 w-105 flex-col gap-0 overflow-hidden p-0">
		<!-- Header -->
		<Dialog.Header class="flex flex-row items-center justify-between border-b px-5 py-4">
			<Dialog.Title class="flex items-center gap-2 text-base font-semibold">
				<CalendarIcon size={16} />
				Appointment
			</Dialog.Title>
		</Dialog.Header>

		{#if booking}
			<!-- Tabs row -->
			<div class="flex min-h-0 flex-1 flex-col overflow-hidden border-b px-5">
				<Tabs.Root value="details" class="flex min-h-0 flex-1 flex-col">
					<div class="flex items-center justify-between">
						<Tabs.List
							variant="line"
							class="h-auto justify-start rounded-none bg-transparent px-0 pb-0"
						>
							<Tabs.Trigger
								value="details"
								class="cursor-pointer rounded-none border-b-2 border-transparent px-3 pt-0 pb-2 text-muted-foreground"
							>
								Details
							</Tabs.Trigger>
							<Tabs.Trigger
								value="history"
								class="cursor-pointer rounded-none border-b-2 border-transparent px-3 pt-0 pb-2 text-muted-foreground"
							>
								History
							</Tabs.Trigger>
						</Tabs.List>
					</div>

					<!-- Label -->
					<div class="flex items-center justify-end gap-2 py-2">
						{#if booking.label}
							<div
								class="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground"
							>
								<Circle size={8} style="color: {LABEL_COLORS[booking.label] ?? 'var(--primary)'}" />
								<span class="max-w-25 truncate">{booking.label}</span>
							</div>
						{:else}
							<span class="text-xs text-muted-foreground">No label</span>
						{/if}
					</div>

					<!-- Details tab -->
					<Tabs.Content
						value="details"
						class="scrollbar -mt-10 min-h-0 flex-1 scrollbar-auto scrollbar-thumb-gray-500   scrollbar-track-transparent overflow-y-auto px-0"
					>
						<div class="flex flex-col gap-4 py-4">
							<!-- Service -->
							<div class="flex items-start gap-3">
								<span
									class="mt-1 size-2.5 shrink-0 rounded-full"
									style="background-color: {booking.color ?? '#0d9488'}"
								></span>
								<div class="flex flex-col">
									<span class="text-sm font-medium">{booking.title}</span>
									<span class="text-xs text-muted-foreground">
										Duration: <span class="font-medium text-foreground">{booking.durationMins}</span
										> mins
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
									<span class="text-sm"
										>{booking.guests.length} Customers{booking.guests.length !== 1 ? 's' : ''}</span
									>
									{#each booking.guests as guest, i (i)}
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

							{#if booking.notes}
								<Separator />
								<div class="flex items-start gap-3">
									<Note size={16} class="mt-0.5 shrink-0 text-muted-foreground" />
									<div class="flex flex-col">
										<span class="text-xs font-medium text-muted-foreground">Notes</span>
										<span class="text-sm">{booking.notes}</span>
									</div>
								</div>
							{/if}
						</div>
					</Tabs.Content>

					<!-- History tab -->
					<Tabs.Content value="history" class="mt-0 min-h-0 flex-1 overflow-y-auto px-0">
						<div class="flex items-center justify-center py-10 text-sm text-muted-foreground">
							No history available
						</div>
					</Tabs.Content>
				</Tabs.Root>
			</div>

			<!-- Footer -->
			<div class="flex justify-end gap-2 border-t px-5 py-3">
				<Button
					variant="outline"
					class="text-outline hover:text-outline"
					onclick={() => {
						open = false;
						editDialogOpen = true;
					}}
				>
					Edit
				</Button>
				<Button
					variant="ghost"
					class="text-destructive hover:text-destructive"
					onclick={onDelete}
					disabled={deleteMutation.isPending}
				>
					{deleteMutation.isPending ? 'Deleting...' : 'Delete'}
				</Button>
			</div>
		{/if}
	</Dialog.Content>
</Dialog.Root>

<EditBookingDialog bind:open={editDialogOpen} {booking} {selectedUserRole} {selectedUserId} />
