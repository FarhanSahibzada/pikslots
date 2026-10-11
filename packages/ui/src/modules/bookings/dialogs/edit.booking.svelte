<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { Field, FieldGroup, FieldLabel, FieldError } from '$lib/components/ui/field/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Calendar } from '$lib/components/ui/calendar/index.js';
	import { createMutation, createQuery, useQueryClient } from '@tanstack/svelte-query';
	import { toast } from 'svelte-sonner';
	import { editBookingMutationOptions } from '../../api/booking/edit.booking.mutation';
	import { getServicesByBusinessQueryOptions } from '../../api/service/get.services.by.business.query';
	import { debounceCustomerSearchQueryOptions } from '../../api/customer/debounce.customer.search.query';
	import { getFreeSlotsForUserQueryOptions } from '../../api/public-booking-page/get.free.slots.query';
	import { businessStore } from '$stores/business.svelte';
	import CalendarIcon from '@lucide/svelte/icons/calendar';
	import Clock from '@tabler/icons-svelte/icons/clock';
	import User from '@tabler/icons-svelte/icons/user';
	import Message from '@tabler/icons-svelte/icons/message';
	import Circle from '@tabler/icons-svelte/icons/circle-filled';
	import ChevronDown from '@tabler/icons-svelte/icons/chevron-down';
	import X from '@tabler/icons-svelte/icons/x';
	import { getLocalTimeZone, today, type DateValue, parseDate } from '@internationalized/date';
	import axios from 'axios';
	import { superForm } from 'sveltekit-superforms';
	import { zod4 as zod } from 'sveltekit-superforms/adapters';
	import { EditBookingSchema } from '../validations/edit-booking-schema';
	import { formatCost, formatDuration } from '$utils/format-time-duration';
	import { untrack, tick } from 'svelte';
	import { getServicesByUserQueryOptions } from '../../api/service-user-assignment/get.services.by.user.query';
	import type { BookingEvent } from './view.booking.svelte';

	let {
		open = $bindable(false),
		booking,
		selectedUserId,
		selectedUserRole
	}: {
		open: boolean;
		booking: BookingEvent | null;
		selectedUserId: string;
		selectedUserRole: string;
	} = $props();

	const queryClient = useQueryClient();
	const businessId = $derived(businessStore.selectedBusiness?.id || '');
	const businessCurrency = $derived(businessStore.selectedBusiness?.locationDetails.currency);
	const assigneeUserId = $derived(selectedUserId || '');

	// ── Label ──────────────────────────────────────────────────────────────────
	const PREDEFINED_LABELS = ['Confirmed', 'Pending', 'Cancelled', 'Completed', 'No Show'] as const;
	const LABEL_COLORS: Record<string, string> = {
		Confirmed: '#22c55e',
		Pending: '#f59e0b',
		Cancelled: '#ef4444',
		Completed: '#3b82f6',
		'No Show': '#a855f7'
	};

	let selectedLabel = $state('');
	let showCustomLabelInput = $state(false);
	let customLabelValue = $state('');
	let labelError = $state(false);

	function selectPredefinedLabel(label: string) {
		selectedLabel = label;
		showCustomLabelInput = false;
		customLabelValue = '';
		labelError = false;
	}

	function openCustomLabelInput() {
		showCustomLabelInput = true;
	}

	function confirmCustomLabel() {
		const trimmed = customLabelValue.trim();
		if (trimmed) {
			selectedLabel = trimmed;
			showCustomLabelInput = false;
			customLabelValue = '';
			labelError = false;
		}
	}

	function clearLabel() {
		selectedLabel = '';
		showCustomLabelInput = false;
		customLabelValue = '';
	}

	// ── Cost / Duration overrides ──────────────────────────────────────────────
	let overrideCost = $state<string>('');
	let overrideDuration = $state<string>('');
	let durationUnit = $state<'mins' | 'hrs'>('mins');
	let serviceSelectOpen = $state(false);
	let bookingNotes = $state('');

	// ______ service Query _______________________________
	const isElevatedRole = $derived(
		selectedUserRole === 'Platform Owner' || selectedUserRole === 'Business Owner'
	);

	const elevatedServicesQuery = createQuery(() => ({
		...getServicesByBusinessQueryOptions(businessId),
		enabled: isElevatedRole && !!businessId
	}));

	const assignedServicesQuery = createQuery(() => ({
		...getServicesByUserQueryOptions(assigneeUserId),
		enabled: !isElevatedRole && !!assigneeUserId
	}));

	const services = $derived(
		isElevatedRole ? (elevatedServicesQuery.data ?? []) : (assignedServicesQuery.data ?? [])
	);

	// _________ Customer Search (debounced) _____________________
	let customerSearch = $state('');
	let debouncedCustomerSearch = $state('');
	let selectedCustomerName = $state('');

	const customerSearchQuery = createQuery(() => ({
		...debounceCustomerSearchQueryOptions(businessId, debouncedCustomerSearch),
		enabled: !!businessId && debouncedCustomerSearch.trim().length > 0 && !$form.customerId
	}));

	const searchResults = $derived(customerSearchQuery.data ?? []);

	$effect(() => {
		const search = customerSearch;
		const timer = setTimeout(() => {
			debouncedCustomerSearch = search;
		}, 500);
		return () => clearTimeout(timer);
	});

	function selectCustomer(id: string, name: string) {
		$form.customerId = id;
		selectedCustomerName = name;
		customerSearch = name;
		debouncedCustomerSearch = '';
	}

	function clearCustomer() {
		$form.customerId = '';
		selectedCustomerName = '';
		customerSearch = '';
		debouncedCustomerSearch = '';
	}

	function onCustomerSearchFocus() {
		if ($form.customerId) {
			$form.customerId = '';
			selectedCustomerName = '';
			customerSearch = '';
			debouncedCustomerSearch = '';
		}
	}

	// _____ edit_booking_mutation_____________________________

	const editMutation = createMutation(editBookingMutationOptions);

	let bookingDate = $state<DateValue>(today(getLocalTimeZone()));
	let bookingDateOpen = $state<boolean>(false);
	let bookingType = $state<string>('service');
	const businessTimezone = $derived(
		businessStore.selectedBusiness?.locationDetails.timeZone || getLocalTimeZone()
	);

	const dateString = $derived(
		`${bookingDate.year}-${String(bookingDate.month).padStart(2, '0')}-${String(bookingDate.day).padStart(2, '0')}`
	);

	// ── Superform ────────────────────────────────────────────────────────────────

	const { form, errors, enhance, submit, reset } = superForm(
		{
			serviceId: '',
			classId: '',
			customerId: '',
			startTime: '',
			endTime: ''
		},
		{
			validators: zod(EditBookingSchema),
			SPA: true,
			resetForm: false,
			onUpdate: async ({ form }) => {
				if (form.valid && booking) {
					const service = services.find((s) => s.id === form.data.serviceId);
					if (!service) {
						toast.error('Please refresh the website and try again');
						return;
					}

					editMutation.mutate({
						bookingId: booking.id,
						input: {
							bookingDate: bookingDate.toString(),
							bookingStartTime: form.data.startTime,
							bookingEndTime: form.data.endTime,
							serviceId: form.data.serviceId,
							userId: assigneeUserId,
							customerId: form.data.customerId,
							...(selectedLabel.trim() ? { label: selectedLabel.trim() } : {}),
							...(bookingNotes.trim() ? { notes: bookingNotes.trim() } : {})
						}
					});
				}
			}
		}
	);

	const selectedService = $derived(services.find((s) => s.id === $form.serviceId));

	$effect(() => {
		const _serviceId = $form.serviceId;
		untrack(() => {
			if (selectedService) {
				overrideCost = (selectedService?.cost / 100).toFixed(2) ?? '';
				overrideDuration =
					durationUnit === 'mins'
						? String(selectedService.durationInMins)
						: String((selectedService.durationInMins / 60).toFixed(1));
			} else {
				overrideCost = '';
				overrideDuration = '';
			}
		});
	});

	// ── Free Slots Query ─────────────────────────────────────────────────────────

	const freeSlotsQuery = createQuery(() => ({
		...getFreeSlotsForUserQueryOptions({
			userId: assigneeUserId,
			businessId,
			date: dateString,
			durationInMins: selectedService?.durationInMins ?? 60,
			bufferTimeInMins: selectedService?.bufferTimeInMins ?? 0,
			businessTimezone
		}),
		enabled: !!businessId && !!assigneeUserId && !!selectedService && dateString.length > 0,
		placeholderData: (keepPreviousData) => keepPreviousData
	}));

	const freeSlots = $derived(freeSlotsQuery.data ?? []);

	function resetForm() {
		bookingDate = today(getLocalTimeZone());
		bookingType = 'service';
		customerSearch = '';
		debouncedCustomerSearch = '';
		selectedCustomerName = '';
		selectedLabel = '';
		showCustomLabelInput = false;
		customLabelValue = '';
		overrideCost = '';
		overrideDuration = '';
		durationUnit = 'mins';
		bookingNotes = '';
		reset({
			data: {
				serviceId: '',
				classId: '',
				customerId: '',
				startTime: '09:00',
				endTime: '10:00'
			}
		});
	}

	function formatDate(value: DateValue) {
		return value.toDate(getLocalTimeZone()).toLocaleDateString('en-GB', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});
	}

	function isWeekend(date: DateValue) {
		const day = date.toDate(getLocalTimeZone()).getDay();
		return day === 0 || day === 6;
	}

	function formatSlotTime(iso: string): string {
		if (!iso) return '';
		const d = new Date(iso);
		if (isNaN(d.getTime())) return '';
		return new Intl.DateTimeFormat('en-US', {
			hour: 'numeric',
			minute: '2-digit',
			hour12: true,
			timeZone: businessTimezone
		}).format(d);
	}

	const startTimeOptions = $derived.by(() => {
		const opts = freeSlots
			.map((s) => ({ iso: s.startTime, label: formatSlotTime(s.startTime) }))
			.filter((o) => o.label);

		if ($form.startTime && !opts.some((o) => o.iso === $form.startTime)) {
			const label = formatSlotTime($form.startTime);
			if (label) opts.unshift({ iso: $form.startTime, label });
		}
		return opts;
	});
	const endTimeOptions = $derived.by(() => {
		const opts = freeSlots
			.map((s) => ({ iso: s.endTime, label: formatSlotTime(s.endTime) }))
			.filter((o) => o.label);
		if ($form.endTime && !opts.some((o) => o.iso === $form.endTime)) {
			const label = formatSlotTime($form.endTime);
			if (label) opts.unshift({ iso: $form.endTime, label });
		}
		return opts;
	});

	function onStartChange(value: string) {
		const slot = freeSlots.find((s) => s.startTime === value);
		if (slot) {
			$form.startTime = slot.startTime;
			$form.endTime = slot.endTime;
		} else {
			$form.startTime = value;
		}
	}

	function onEndChange(value: string) {
		const slot = freeSlots.find((s) => s.endTime === value);
		if (slot) {
			$form.startTime = slot.startTime;
			$form.endTime = slot.endTime;
		} else {
			$form.endTime = value;
		}
	}

	$effect(() => {
		if (editMutation.isSuccess) {
			queryClient.invalidateQueries({ queryKey: ['bookings-by-business-for-user'] });
			toast.success('Booking updated successfully');
			open = false;
			resetForm();
			editMutation.reset();
		}

		if (editMutation.isError) {
			const error = editMutation.error;
			if (axios.isAxiosError(error)) {
				toast.error(error?.response?.data?.message ?? 'Failed to update booking');
			}
		}
	});

	// Pre-fill form when dialog opens with booking data
	$effect(() => {
		if (open && booking) {
			bookingDate = parseDate(booking.bookingDate.split('T')[0]);
			$form.serviceId = booking.serviceId;
			$form.customerId = booking.customerId;
			$form.startTime = booking.start.toISOString();
			$form.endTime = booking.end.toISOString();
			selectedLabel = booking.label ?? '';
			bookingNotes = booking.notes ?? '';

			// Pre-fill customer search display
			if (booking.guests.length > 0) {
				selectedCustomerName = booking.guests[0].name;
				customerSearch = booking.guests[0].name;
			}
		}
	});

	$effect(() => {
		if (open && services.length > 0) {
			tick().then(() => {
				serviceSelectOpen = true;
			});
		}
	});

	$effect(() => {
		const slots = freeSlots;
		untrack(() => {
			if (slots.length > 0 && !$form.startTime) {
				$form.startTime = slots[0].startTime;
				$form.endTime = slots[0].endTime;
			}
		});
	});
</script>

<Dialog.Root
	bind:open
	onOpenChange={(v) => {
		if (!v) resetForm();
	}}
>
	<Dialog.Content class="flex max-h-[95vh] w-105 flex-col rounded-2xl sm:max-w-xl">
		<Dialog.Header>
			<Dialog.Title class="flex items-center gap-2 text-base font-semibold">
				<CalendarIcon class="size-4" />
				Edit Appointment
			</Dialog.Title>
		</Dialog.Header>

		<form method="POST" use:enhance class="flex flex-1 flex-col overflow-hidden">
			<Tabs.Root
				bind:value={bookingType}
				class="flex min-h-0 w-full flex-1 flex-col overflow-hidden"
			>
				<Tabs.List variant="line" class="justify-start px-0">
					<Tabs.Trigger value="service" class="cursor-pointer">Services</Tabs.Trigger>
				</Tabs.List>

				<!-- Label -->
				<div class="flex items-center justify-end gap-2 py-2">
					{#if showCustomLabelInput}
						<Input
							bind:value={customLabelValue}
							placeholder="Enter label..."
							class="h-7 w-28 text-xs"
							autofocus
							onkeydown={(e) => {
								if (e.key === 'Enter') confirmCustomLabel();
								if (e.key === 'Escape') {
									showCustomLabelInput = false;
									customLabelValue = '';
								}
							}}
							onblur={() => {
								if (!customLabelValue.trim()) {
									showCustomLabelInput = false;
								}
							}}
						/>
					{:else}
						<DropdownMenu.Root>
							<DropdownMenu.Trigger
								class="flex shrink-0 cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
							>
								{#if selectedLabel}
									<Circle
										size={8}
										style="color: {LABEL_COLORS[selectedLabel] ?? 'var(--primary)'}"
									/>
									<span class="max-w-25 truncate">{selectedLabel}</span>
								{:else}
									<span>No label</span>
								{/if}
								<ChevronDown size={12} />
							</DropdownMenu.Trigger>
							<DropdownMenu.Content align="start" class="z-50 w-44">
								{#each PREDEFINED_LABELS as lbl (lbl)}
									<DropdownMenu.Item
										onclick={() => selectPredefinedLabel(lbl)}
										class="cursor-pointer gap-2 text-xs"
									>
										<Circle size={8} style="color: {LABEL_COLORS[lbl]}" />
										<span>{lbl}</span>
										{#if selectedLabel === lbl}
											<span class="ml-auto text-muted-foreground">&#10003;</span>
										{/if}
									</DropdownMenu.Item>
								{/each}
								<DropdownMenu.Separator />
								<DropdownMenu.Item onclick={openCustomLabelInput} class="cursor-pointer text-xs">
									Custom
								</DropdownMenu.Item>
							</DropdownMenu.Content>
						</DropdownMenu.Root>
						{#if selectedLabel}
							<button
								type="button"
								onclick={clearLabel}
								class="flex shrink-0 cursor-pointer items-center justify-center rounded-md p-0.5 text-muted-foreground hover:text-foreground"
							>
								<X size={12} />
							</button>
						{/if}
					{/if}
				</div>

				<!-- ── Services Tab ────────────────────────────────────────────── -->

				<Tabs.Content
					value="service"
					class="scrollbar -mt-6 min-h-0 flex-1
				 scrollbar-auto scrollbar-thumb-gray-500 scrollbar-track-transparent overflow-y-auto pr-2"
				>
					<FieldGroup>
						<Field>
							<FieldLabel class="flex items-center gap-1.5"
								><span
									class="inline-block size-3.5 shrink-0 rounded-full"
									style="background-color: {selectedService?.colorCode ||
										booking?.color ||
										'#0d9488'}"
								></span>
								Service <span class="text-destructive">*</span></FieldLabel
							>
							<Select.Root type="single" bind:value={$form.serviceId} bind:open={serviceSelectOpen}>
								<Select.Trigger
									class="w-full"
									disabled={services.length === 0}
									aria-invalid={$errors.serviceId ? true : undefined}
								>
									{$form.serviceId ? selectedService?.title : 'Select a service'}
								</Select.Trigger>
								<Select.Content>
									{#if services.length === 0}
										<Select.Item disabled value="No service available"
											>No services available</Select.Item
										>
									{:else}
										{#each services as service (service.id)}
											<Select.Item value={service.id}>
												{service.title} - {formatDuration(service.durationInMins)} - {formatCost(
													service.cost / 100,
													businessCurrency || '$'
												)}
											</Select.Item>
										{/each}
									{/if}
								</Select.Content>
							</Select.Root>
							<FieldError errors={$errors.serviceId?.map((e) => ({ message: e }))} />
						</Field>

						{#if selectedService}
							<div class="grid grid-cols-2 gap-3">
								<Field>
									<FieldLabel>Cost ({businessCurrency || '$'})</FieldLabel>
									<Input
										type="number"
										step="0.01"
										min="0"
										placeholder={(selectedService.cost / 100).toFixed(2)}
										bind:value={overrideCost}
									/>
								</Field>
								<Field>
									<FieldLabel>Duration</FieldLabel>
									<div class="flex gap-2">
										<Input
											type="number"
											step="1"
											min="1"
											placeholder={durationUnit === 'mins'
												? String(selectedService.durationInMins)
												: String((selectedService.durationInMins / 60).toFixed(1))}
											bind:value={overrideDuration}
											class="flex-1"
										/>
										<Select.Root type="single" bind:value={durationUnit}>
											<Select.Trigger class="w-20 shrink-0">
												{durationUnit === 'mins' ? 'Mins' : 'Hrs'}
											</Select.Trigger>
											<Select.Content>
												<Select.Item value="mins">Mins</Select.Item>
												<Select.Item value="hrs">Hrs</Select.Item>
											</Select.Content>
										</Select.Root>
									</div>
								</Field>
							</div>
						{/if}

						<Field>
							<FieldLabel class="flex items-center gap-1.5"
								><CalendarIcon size={14} /> Date</FieldLabel
							>
							<Popover.Root bind:open={bookingDateOpen}>
								<Popover.Trigger class="w-full">
									{#snippet child({ props })}
										<Button {...props} variant="outline" class="w-full justify-between font-normal">
											{formatDate(bookingDate)}
											<CalendarIcon class="text-muted-foreground" />
										</Button>
									{/snippet}
								</Popover.Trigger>
								<Popover.Content class="w-auto p-0" align="start">
									<Calendar
										type="single"
										value={bookingDate}
										captionLayout="dropdown"
										minValue={today(getLocalTimeZone())}
										isDateDisabled={selectedService ? isWeekend : undefined}
										onValueChange={(value) => {
											if (!value) return;
											bookingDate = value;
											bookingDateOpen = false;
										}}
									/>
								</Popover.Content>
							</Popover.Root>
						</Field>

						<div
							class="transition-all duration-200 ease-in-out"
							class:pointer-events-none={!selectedService}
							class:opacity-40={!selectedService}
						>
							{#if freeSlotsQuery.isPending && !!selectedService}
								<div
									class="flex items-center gap-2 rounded-md border border-dashed border-muted-foreground/30 bg-muted/30 px-3 py-2.5"
								>
									<svg
										class="size-4 animate-spin text-muted-foreground"
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
									>
										<circle
											class="opacity-25"
											cx="12"
											cy="12"
											r="10"
											stroke="currentColor"
											stroke-width="4"
										></circle>
										<path
											class="opacity-75"
											fill="currentColor"
											d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
										></path>
									</svg>
									<span class="text-xs text-muted-foreground">Finding available time slots...</span>
								</div>
							{:else if freeSlots.length === 0 && selectedService && $form.startTime.length == 0}
								<div
									class="flex items-center gap-2 rounded-md border border-dashed border-amber-300 bg-amber-50 px-3 py-2.5 dark:border-amber-700 dark:bg-amber-950/30"
								>
									<svg
										class="size-4 shrink-0 text-amber-600 dark:text-amber-400"
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
										stroke-width="1.5"
										stroke="currentColor"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
										/>
									</svg>
									<span class="text-xs text-amber-700 dark:text-amber-300"
										>No available time slots for this date. Try selecting a different date.</span
									>
								</div>
							{:else}
								<div class="grid grid-cols-2 gap-3">
									<Field>
										<FieldLabel class="flex items-center gap-1.5"
											><Clock size={14} /> Start Time
											<span class="text-destructive">*</span></FieldLabel
										>
										<Select.Root
											type="single"
											value={$form.startTime}
											onValueChange={onStartChange}
											disabled={!selectedService}
										>
											<Select.Trigger class="w-full">
												{startTimeOptions.find((o) => o.iso === $form.startTime)?.label ??
													'Select start'}
											</Select.Trigger>
											<Select.Content viewportClass="max-h-60">
												{#each startTimeOptions as opt (opt.iso)}
													<Select.Item value={opt.iso}>{opt.label}</Select.Item>
												{/each}
											</Select.Content>
										</Select.Root>
									</Field>
									<Field>
										<FieldLabel class="flex items-center gap-1.5"
											><Clock size={14} /> End Time
											<span class="text-destructive">*</span></FieldLabel
										>
										<Select.Root
											type="single"
											value={$form.endTime}
											onValueChange={onEndChange}
											disabled={!selectedService}
										>
											<Select.Trigger class="w-full">
												{endTimeOptions.find((o) => o.iso === $form.endTime)?.label ?? 'Select end'}
											</Select.Trigger>
											<Select.Content viewportClass="max-h-60">
												{#each endTimeOptions as opt (opt.iso)}
													<Select.Item value={opt.iso}>{opt.label}</Select.Item>
												{/each}
											</Select.Content>
										</Select.Root>
									</Field>
								</div>
							{/if}
						</div>

						<!-- search for a customer -->
						<Field>
							<FieldLabel class="flex items-center gap-1.5"
								><User size={14} /> Customer <span class="text-destructive">*</span></FieldLabel
							>
							<div class="relative">
								<Input
									type="text"
									placeholder="Search customers..."
									bind:value={customerSearch}
									class={$errors.customerId ? 'border-destructive' : ''}
									onfocus={onCustomerSearchFocus}
								/>
								{#if $form.customerId || customerSearch.trim().length > 0}
									<button
										type="button"
										class="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
										onclick={clearCustomer}
									>
										&times;
									</button>
								{/if}
								{#if customerSearch.trim().length > 0 && !$form.customerId}
									<div
										class="absolute z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-md border bg-popover shadow-md"
									>
										{#if customerSearchQuery.isPending}
											<div class="px-3 py-2 text-xs text-muted-foreground">Searching...</div>
										{:else if searchResults.length === 0}
											<div class="px-3 py-2 text-xs text-muted-foreground">No customers found</div>
										{:else}
											{#each searchResults as customer (customer.id)}
												<button
													type="button"
													class="flex w-full flex-col items-start border-2 border-b px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
													onclick={() =>
														selectCustomer(
															customer.id,
															`${customer.firstName} ${customer.lastName}`
														)}
												>
													<span>{customer.firstName} {customer.lastName}</span>
													{#if customer.email}
														<span class="text-xs text-muted-foreground">{customer.email}</span>
													{/if}
												</button>
											{/each}
										{/if}
									</div>
								{/if}
							</div>
							<FieldError errors={$errors.customerId?.map((e) => ({ message: e }))} />
						</Field>

						<Field>
							<FieldLabel
								><Message size={14} /> Notes
								<span class="text-xs text-muted-foreground">(optional)</span></FieldLabel
							>
							<textarea
								class="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
								placeholder="Add any notes for this booking..."
								bind:value={bookingNotes}
							></textarea>
						</Field>
					</FieldGroup>
				</Tabs.Content>
			</Tabs.Root>

			<Dialog.Footer class="mt-4 flex items-center justify-center">
				{#if labelError && !selectedLabel.trim()}
					<span class="text-xs text-destructive">Please select a label</span>
				{/if}
				<Button
					type="button"
					variant="ghost"
					onclick={() => (open = false)}
					disabled={editMutation.isPending}
				>
					Cancel
				</Button>
				{#if bookingType === 'service'}
					<div class="flex items-center gap-2">
						<Button
							type="button"
							onclick={() => {
								if (!selectedLabel.trim()) {
									labelError = true;
									return;
								}
								labelError = false;
								submit();
							}}
							disabled={editMutation.isPending}
						>
							{editMutation.isPending ? 'Saving...' : 'Save Changes'}
						</Button>
					</div>
				{:else}
					<Button type="button" disabled>Coming Soon</Button>
				{/if}
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
