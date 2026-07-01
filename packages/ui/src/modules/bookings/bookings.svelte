<script lang="ts">
	import { Calendar } from '@fullcalendar/core';
	import dayGridPlugin from '@fullcalendar/daygrid';
	import timeGridPlugin from '@fullcalendar/timegrid';
	import listPlugin from '@fullcalendar/list';
	import Plus from '@tabler/icons-svelte/icons/plus';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import { createQuery } from '@tanstack/svelte-query';
	import { getUsersInsideBusinessQueryOptions } from '../api/user/get.users.inside.business.query';
	import { businessStore } from '$stores/business.svelte';
	import { authStore } from '$stores/auth.svelte';
	import ViewBookingDialog from './dialogs/view.booking.svelte';
	import type { BookingEvent } from './dialogs/view.booking.svelte';

	// ── State ───────────────────────────────────────────────────────────────────

	let calendarEl: HTMLElement | null = null;
	let fullCalendar: Calendar | null = null;

	const jwtPayload = $derived(authStore.getPayloadData());

	// ── Queries ──────────────────────────────────────────────────────────────────

	const usersQuery = createQuery(() => ({
		...getUsersInsideBusinessQueryOptions(businessStore.selectedBusiness?.id ?? ''),
		enabled: !!businessStore.selectedBusiness?.id
	}));

	const users = $derived(usersQuery.data ?? []);
	const currentUser = $derived(users.find((u) => u.id === jwtPayload?.userId));
	const teamMembers = $derived(users.filter((u) => u.id !== jwtPayload?.userId));

	// ── Dialog state ─────────────────────────────────────────────────────────────

	let dialogOpen = $state(false);
	let selectedBooking = $state<BookingEvent | null>(null);

	// ── Test events ──────────────────────────────────────────────────────────────

	const now = new Date();
	const testEvents = [
		{
			id: '1',
			title: '15 Minutes Meeting',
			start: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0),
			end: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 15),
			color: '#0d9488',
			extendedProps: {
				durationMins: 15,
				host: 'Afaq Javed',
				guests: [{ name: 'Guest', deleted: true }],
				bookingId: 'ECRMWYEE',
				source: 'Booked from Web App'
			}
		},
		{
			id: '2',
			title: 'Strategy Call',
			start: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 14, 0),
			end: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 15, 0),
			color: '#6366f1',
			extendedProps: {
				durationMins: 60,
				host: 'Afaq Javed',
				guests: [{ name: 'Sarah Connor' }, { name: 'John Doe' }],
				bookingId: 'STRGY001',
				source: 'Booked from Web App'
			}
		},
		{
			id: '3',
			title: 'Onboarding Session',
			start: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3, 9, 30),
			end: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3, 10, 0),
			color: '#f59e0b',
			extendedProps: {
				durationMins: 30,
				host: 'Afaq Javed',
				guests: [{ name: 'Alex Smith' }],
				bookingId: 'ONBRD002',
				source: 'Booked from Web App'
			}
		}
	];

	// ── Calendar ─────────────────────────────────────────────────────────────────

	$effect(() => {
		calendarEl = document.getElementById('calendar');

		fullCalendar = new Calendar(calendarEl!, {
			plugins: [dayGridPlugin, timeGridPlugin, listPlugin],
			initialView: 'dayGridMonth',
			headerToolbar: {
				left: 'prev,next today',
				center: 'title',
				right: 'dayGridMonth,timeGridWeek,listWeek'
			},
			buttonText: {
				today: 'Today',
				month: 'Month',
				week: 'Week',
				list: 'List'
			},
			noEventsText: 'No bookings for this period',
			events: testEvents,
			eventClick: (info) => {
				const p = info.event.extendedProps;
				selectedBooking = {
					id: info.event.id,
					title: info.event.title,
					start: info.event.start!,
					end: info.event.end!,
					durationMins: p.durationMins,
					host: p.host,
					guests: p.guests,
					bookingId: p.bookingId,
					source: p.source,
					color: info.event.backgroundColor
				};
				dialogOpen = true;
			},
			height: '100%',
			expandRows: true,
			handleWindowResize: true
		});
		fullCalendar.render();
	});
</script>

<ViewBookingDialog bind:open={dialogOpen} booking={selectedBooking} />

<div class="flex h-full min-h-0 flex-1">
	<!-- ── Left: sidebar ──────────────────────────────────────────────────── -->
	<div class=" flex w-56 shrink-0 flex-col gap-5 px-3 py-4">
		<!-- Your calendars -->
		<div class="flex flex-col gap-1">
			<span class="px-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase"
				>Your calendars</span
			>
			{#if currentUser}
				<div
					class="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 hover:bg-accent"
				>
					<Avatar.Root class="size-6 text-[10px]">
						<Avatar.Fallback class="bg-primary text-[10px] text-primary-foreground">
							{currentUser.name.firstName[0]}{currentUser.name.lastName[0]}
						</Avatar.Fallback>
					</Avatar.Root>
					<span class="truncate text-sm"
						>{currentUser.name.firstName} {currentUser.name.lastName}</span
					>
				</div>
			{/if}
			<button
				type="button"
				class="flex items-center gap-2 px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
			>
				<Plus size={13} />
				Connect calendar
			</button>
		</div>

		<!-- Team -->
		{#if teamMembers.length > 0}
			<div class="flex flex-col gap-1">
				<span class="px-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase"
					>Team</span
				>
				{#each teamMembers as user (user.id)}
					<div
						class="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 hover:bg-accent"
					>
						<Avatar.Root class="size-6 text-[10px]">
							<Avatar.Fallback class="bg-muted text-[10px] text-muted-foreground">
								{user.name.firstName[0]}{user.name.lastName[0]}
							</Avatar.Fallback>
						</Avatar.Root>
						<div class="flex min-w-0 flex-col">
							<span class="truncate text-sm">{user.name.firstName} {user.name.lastName}</span>
							<span class="truncate text-xs text-muted-foreground">{user.role}</span>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>

	<!-- ── Right: calendar ───────────────────────────────────────────────── -->
	<div class="flex flex-1 flex-col overflow-hidden">
		<div id="calendar" class="calendar-wrapper"></div>
	</div>
</div>

<style>
	.calendar-wrapper {
		height: 100%;
		min-height: 90dvh;
		font-size: 0.8rem;
		font-family: 'Roboto Variable', sans-serif;
	}

	:global(.calendar-wrapper .fc) {
		font-family: 'Roboto Variable', sans-serif;
	}

	/* ── Today highlight → shadcn primary ── */
	:global(.calendar-wrapper .fc-day-today) {
		background-color: color-mix(in oklch, var(--primary) 10%, transparent) !important;
	}

	:global(.calendar-wrapper .fc-timegrid-col.fc-day-today) {
		background-color: color-mix(in oklch, var(--primary) 8%, transparent) !important;
	}

	:global(.dark .calendar-wrapper .fc-day-today) {
		background-color: color-mix(in oklch, var(--primary) 25%, transparent) !important;
	}

	:global(.dark .calendar-wrapper .fc-timegrid-col.fc-day-today) {
		background-color: color-mix(in oklch, var(--primary) 20%, transparent) !important;
	}

	/* ── List view transparent background ── */
	:global(.calendar-wrapper .fc-list),
	:global(.calendar-wrapper .fc-list-table),
	:global(.calendar-wrapper .fc-list-day-cushion),
	:global(.calendar-wrapper .fc-list-event),
	:global(.calendar-wrapper .fc-list-empty) {
		background: transparent !important;
	}

	:global(.calendar-wrapper .fc-list-empty) {
		font-size: 0.85rem;
		color: var(--muted-foreground);
	}

	/* ── FullCalendar buttons → shadcn primary theme ── */
	:global(.calendar-wrapper .fc-button-primary) {
		background-color: var(--primary);
		color: var(--primary-foreground);
		border-color: var(--primary);
		border-radius: var(--radius);
		box-shadow: none;
		outline: none;
	}

	:global(.calendar-wrapper .fc-button-primary:hover) {
		background-color: color-mix(in oklch, var(--primary) 85%, black);
		border-color: color-mix(in oklch, var(--primary) 85%, black);
	}

	:global(.calendar-wrapper .fc-button-primary:focus) {
		box-shadow:
			0 0 0 2px var(--background),
			0 0 0 4px var(--ring);
	}

	:global(.calendar-wrapper .fc-button-primary:disabled) {
		background-color: var(--primary);
		border-color: var(--primary);
		opacity: 0.4;
		cursor: not-allowed;
	}

	:global(.calendar-wrapper .fc-button-primary:not(:disabled):active),
	:global(.calendar-wrapper .fc-button-primary:not(:disabled).fc-button-active) {
		background-color: color-mix(in oklch, var(--primary) 75%, black);
		border-color: color-mix(in oklch, var(--primary) 75%, black);
		box-shadow: none;
	}

	:global(.calendar-wrapper .fc-button:focus),
	:global(.calendar-wrapper .fc-button:active),
	:global(.calendar-wrapper .fc-button-primary:not(:disabled):active:focus),
	:global(.calendar-wrapper .fc-button-primary:not(:disabled).fc-button-active:focus) {
		box-shadow: none !important;
		outline: none !important;
	}
</style>
