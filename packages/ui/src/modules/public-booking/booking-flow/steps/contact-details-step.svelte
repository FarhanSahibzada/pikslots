<script lang="ts">
	import { Field, FieldGroup, FieldLabel, FieldError } from '$lib/components/ui/field/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { z } from 'zod';
	import type { BookingContactFields, StandardContactField } from '@pikslots/shared';
	import type { ContactDetails } from '../booking-flow-state.svelte';
	import type { PublicBusiness, PublicService, PublicSlot, PublicTeamMember } from '../../types';
	import Checkbox from '$lib/components/ui/checkbox/checkbox.svelte';
	import { Label } from 'bits-ui';
	import { toast } from 'svelte-sonner';
	import { createMutation, useQueryClient } from '@tanstack/svelte-query';
	import { registerPublicBookingMutationOptions } from '../../../api/public-booking-page/register.public.booking.mutation';

	type StandardFieldKey = 'firstName' | 'lastName' | 'email' | 'phone' | 'address';

	const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	const PHONE_REGEX = /^[+\d][\d\s().-]*$/;

	const MESSAGES: Record<StandardFieldKey, string> = {
		firstName: 'First name is required',
		lastName: 'Last name is required',
		email: 'Email is required',
		phone: 'Phone is required',
		address: 'Address is required'
	};

	let {
		contact,
		business,
		fields,
		brandColor,
		buttonShape,
		service,
		slot,
		bookingDate,
		teamMember,
		onSubmit
	}: {
		contact: ContactDetails;
		business: PublicBusiness;
		fields: BookingContactFields;
		brandColor: string;
		buttonShape: string;
		service: PublicService;
		slot: PublicSlot;
		bookingDate: string;
		teamMember: PublicTeamMember;
		onSubmit: (bookingReference: string) => void;
	} = $props();

	let isChecked = $state<boolean>(false);
	const queryClient = useQueryClient();
	const registerMutation = createMutation(() => registerPublicBookingMutationOptions());

	const standardFields = $derived([
		{
			key: 'firstName' as const,
			label: 'First name',
			type: 'text',
			placeholder: 'Jane',
			...fields.name
		},
		{
			key: 'lastName' as const,
			label: 'Last name',
			type: 'text',
			placeholder: 'Doe',
			...fields.name
		},
		{
			key: 'phone' as const,
			label: 'Phone Number',
			type: 'tel',
			placeholder: '+92 03423 22...',
			...fields.phone
		},
		{
			key: 'email' as const,
			label: 'Email',
			type: 'email',
			placeholder: 'jane@example.com',
			...fields.email
		},
		{
			key: 'address' as const,
			label: 'Address',
			type: 'text',
			placeholder: '123 Main St',
			...fields.address
		}
	]);

	const customFields = $derived(fields.customFields.filter((field) => field.enabled));
	const businessTermsAndCondition = $derived(business.bookingLabelOverrides.termsAndConditions);

	const touched = $state<Record<string, boolean>>({});

	$effect(() => {
		for (const field of customFields) {
			if (!Object.hasOwn(contact.customFields, field.label)) {
				contact.customFields[field.label] = '';
			}
		}
	});

	// _____zod validation__________________________

	function fieldSchema(key: StandardFieldKey, config: StandardContactField) {
		if (key === 'email') {
			const email = z.string().trim().regex(EMAIL_REGEX, 'Enter a valid email address');
			return config.required
				? z.string().trim().min(1, MESSAGES.email).regex(EMAIL_REGEX, 'Enter a valid email address')
				: z.union([z.literal(''), email]);
		}

		if (key === 'phone') {
			const phone = z.string().trim().regex(PHONE_REGEX, 'Enter a valid phone number');
			return config.required
				? z.string().trim().min(1, MESSAGES.phone).regex(PHONE_REGEX, 'Enter a valid phone number')
				: z.union([z.literal(''), phone]);
		}

		if (!config.enabled) return z.union([z.string(), z.number()]);
		return config.required
			? z.string().trim().min(1, MESSAGES[key])
			: z.union([z.string(), z.number()]);
	}

	const schema = $derived(
		z.object({
			firstName: fieldSchema('firstName', fields.name),
			lastName: fieldSchema('lastName', fields.name),
			email: fieldSchema('email', fields.email),
			phone: fieldSchema('phone', fields.phone),
			address: fieldSchema('address', fields.address),
			customFields: z.object(
				customFields.reduce<Record<string, z.ZodType<string | number>>>((shape, field) => {
					shape[field.label] = field.required
						? z.string().trim().min(1, `${field.label} is required`)
						: z.union([z.string(), z.number()]);
					return shape;
				}, {})
			)
		})
	);

	const payload = $derived.by(() => ({
		firstName: contact.firstName ?? '',
		lastName: contact.lastName ?? '',
		email: contact.email ?? '',
		phone: contact.phone ?? '',
		address: contact.address ?? '',
		customFields: Object.fromEntries(
			customFields.map((field) => [
				field.label,
				typeof contact.customFields[field.label] === 'string'
					? contact.customFields[field.label]
					: ''
			])
		)
	}));

	const validation = $derived.by(() => {
		const result = schema.safeParse(payload);
		const errors: Record<string, string> = {};
		if (!result.success) {
			for (const issue of result.error.issues) {
				const isCustom = issue.path[0] === 'customFields';
				const key = isCustom ? issue.path[1] : issue.path[0];
				if (key !== undefined && !(key in errors)) {
					errors[String(key)] = issue.message;
				}
			}
		}
		return { valid: result.success, errors };
	});

	const isValid = $derived(validation.valid);
	const termsRequired = $derived(businessTermsAndCondition.requireTermsAcceptance);
	const canSubmit = $derived(isValid && !termsRequired ? true : isValid && isChecked);
	const isPending = $derived(registerMutation.isPending);

	async function handleSubmit() {
		if (!canSubmit || isPending) return;

		try {
			const result = await registerMutation.mutateAsync({
				businessId: business.id,
				serviceId: service.id,
				userId: teamMember?.id,
				bookingDate,
				bookingStartTime: slot.startTime,
				bookingEndTime: slot.endTime,
				contact: {
					firstName: contact.firstName.trim(),
					lastName: contact.lastName.trim(),
					email: contact.email?.trim() || null,
					phone: contact.phone?.trim() || null,
					address: contact.address?.trim() || null,
					customFields: { ...contact.customFields }
				},
				termsAccepted: termsRequired ? isChecked : undefined
			});

			toast.success('Booking confirmed successfully!');
			await queryClient.invalidateQueries({ queryKey: ['booking-page-details'] });
			onSubmit(result.bookingId);
		} catch (error) {
			const message =
				(error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
				'Failed to confirm booking. Please try again.';
			toast.error(message);
		}
	}
</script>

<div class="flex flex-col gap-4">
	<h2 class="text-lg font-semibold">Your details</h2>

	<FieldGroup class="max-w-sm">
		{#each standardFields as field (field.key)}
			{#if field.enabled}
				<Field>
					<FieldLabel>{field.label}{field.required ? ' *' : ''}</FieldLabel>
					<Input
						type={field.type}
						bind:value={contact[field.key]}
						placeholder={field.placeholder}
						onblur={() => (touched[field.key] = true)}
					/>
					{#if touched[field.key] && Object.hasOwn(validation.errors, field.key)}
						<FieldError>{validation.errors[field.key]}</FieldError>
					{/if}
				</Field>
			{/if}
		{/each}

		{#each customFields as field, i (i)}
			<Field>
				<FieldLabel>{field.label}{field.required ? ' *' : ''}</FieldLabel>
				<Input
					bind:value={contact.customFields[field.label]}
					placeholder={field.label}
					onblur={() => (touched[field.label] = true)}
				/>
				{#if touched[field.label] && Object.hasOwn(validation.errors, field.label)}
					<FieldError>{validation.errors[field.label]}</FieldError>
				{/if}
			</Field>
		{/each}
	</FieldGroup>
	{#if businessTermsAndCondition.label.length > 0}
		<div class="items- flex justify-start gap-2 p-2">
			<Checkbox
				bind:checked={isChecked}
				id="terms"
				aria-labelledby="terms-label"
				class="data-[state=unchecked]:border-border-input data-[state=unchecked]:hover:border-dark-40 peer inline-flex size-5.25 items-center justify-center rounded-xl border border-muted bg-foreground transition-all  duration-150 ease-in-out active:scale-[0.98] data-[state=unchecked]:bg-background"
			/>
			<div class="flex flex-col justify-start gap-2">
				<Label.Root
					id="terms-label"
					for="terms"
					class="text-sm  leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
				>
					I agree to the <a
						href={businessTermsAndCondition.link}
						class="text-sm underline decoration-2 underline-offset-4"
						style={`color: ${brandColor}`}
					>
						{businessTermsAndCondition.label}
					</a>
				</Label.Root>
			</div>
		</div>
	{/if}

	<Button
		class="{buttonShape === 'pill'
			? 'rounded-full'
			: buttonShape === 'rounded '
				? 'rounded-xl'
				: 'rounded-none'} w-fit text-white"
		style="background-color:{brandColor}"
		disabled={!canSubmit || isPending}
		onclick={handleSubmit}>{isPending ? 'Confirming…' : 'Confirm booking'}</Button
	>
</div>
