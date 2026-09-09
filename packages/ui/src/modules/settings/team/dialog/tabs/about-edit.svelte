<script lang="ts">
	import * as Select from '$lib/components/ui/select/index';
	import { Field, FieldGroup, FieldLabel, FieldError } from '$lib/components/ui/field/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { createMutation, useQueryClient } from '@tanstack/svelte-query';
	import { toast } from 'svelte-sonner';
	import { superForm } from 'sveltekit-superforms';
	import { zod4 as zod } from 'sveltekit-superforms/adapters';
	import z from 'zod';
	import { updateUserProfileMutationOptions } from '../../../../api/user/update.user.profile.mutation';
	import type { UserSummary, UserRole, UpdateUserProfileInput } from '@pikslots/shared';
	import LockUp from '@tabler/icons-svelte/icons/lock-up';
	import Mail from '@tabler/icons-svelte/icons/mail';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import { authStore } from '$stores/auth.svelte';
	import { User } from '@lucide/svelte';

	let { user, onClose }: { user: UserSummary; onClose: () => void } = $props();

	const queryClient = useQueryClient();

	const COUNTRY_CODES = [
		{ code: '+1', country: 'US' },
		{ code: '+44', country: 'GB' },
		{ code: '+92', country: 'PK' },
		{ code: '+91', country: 'IN' },
		{ code: '+61', country: 'AU' },
		{ code: '+49', country: 'DE' },
		{ code: '+33', country: 'FR' },
		{ code: '+971', country: 'AE' },
		{ code: '+966', country: 'SA' }
	] as const;

	const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
		{ value: 'Enhanced', label: 'Enhanced' },
		{ value: 'Standard', label: 'Standard' },
		{ value: 'Admin', label: 'Admin' },
		{ value: 'Business Owner', label: 'Business Owner' }
	];

	const ROLE_STYLES: Record<UserRole, string> = {
		'Platform Owner': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
		'Business Owner': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
		Admin: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
		Enhanced: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
		Standard: 'bg-muted text-muted-foreground',
		'No Access': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
	};

	const payload = $derived(authStore.getPayloadData());
	const currentUserId = $derived(payload?.userId ?? '');
	const callerRole = $derived(payload?.role ?? '');
	const isSelf = $derived(currentUserId === user.id);

	const canChangeRole = $derived.by(() => {
		if (callerRole === 'Admin') {
			if (user.role === 'Business Owner') {
				return false;
			}
		} else if (callerRole === 'Business Owner') {
			if (user.role === 'Platform Owner') {
				return false;
			}
		}

		return (
			!isSelf &&
			(callerRole === 'Platform Owner' || callerRole === 'Business Owner' || callerRole === 'Admin')
		);
	});

	function parsePhone(phone: string | null): { code: string; number: string } {
		if (!phone) return { code: '+92', number: '' };
		const known = COUNTRY_CODES.map((c) => c.code).sort((a, b) => b.length - a.length);
		for (const code of known) {
			if (phone.startsWith(code)) {
				return { code, number: phone.slice(code.length).trim() };
			}
		}
		return { code: '+92', number: phone };
	}

	const { code: initialCode, number: initialNumber } = $derived(parsePhone(user.phone));

	const ProfileSchema = z.object({
		firstName: z.string().min(1, 'First name is required'),
		lastName: z.string().min(1, 'Last name is required'),
		phone: z.string().optional(),
		email: z.string().email('Invalid email address')
	});

	// svelte-ignore state_referenced_locally
	const { form, errors, tainted, enhance } = superForm(
		{
			firstName: user.name.firstName,
			lastName: user.name.lastName,
			phone: initialNumber,
			email: user.email
		},
		{
			validators: zod(ProfileSchema),
			SPA: true,
			resetForm: false,
			onUpdate({ form }) {
				if (form.valid) {
					const phone = form.data.phone
						? `${countryCode ? countryCode : initialCode} ${form.data.phone}`
						: undefined;
					const payload: UpdateUserProfileInput = {
						userId: user.id,
						firstName: form.data.firstName,
						lastName: form.data.lastName,
						phone,
						email: form.data.email
					};
					if (canChangeRole && selectedRole !== user.role) {
						payload.role = selectedRole;
					}
					updateProfileMutation.mutate(payload);
				}
			}
		}
	);

	let countryCode = $state('');
	let countryCodeSelect = $state(false);

	// eslint-disable-next-line svelte/no-unused-svelte-ignore
	// svelte-ignore state_referenced_locally
	let selectedRole: UserRole = $derived(user.role);
	let roleSelectOpen = $state(false);

	const updateProfileMutation = createMutation(() => updateUserProfileMutationOptions());

	const isSaving = $derived(updateProfileMutation.isPending);
	const isDirty = $derived(
		($tainted && Object.values($tainted).some((v) => v === true)) ||
			(canChangeRole && selectedRole !== user.role)
	);

	$effect(() => {
		if (updateProfileMutation.isSuccess) {
			queryClient.invalidateQueries({ queryKey: ['users-inside-business'] });
			toast.success('Profile updated successfully');
			onClose();
		}
		if (updateProfileMutation.isError) {
			toast.error(
				updateProfileMutation.error?.response?.data?.message ?? 'Failed to update profile'
			);
		}
	});

	function close() {
		updateProfileMutation.reset();
		onClose();
	}

	$effect(() => {
		const role = callerRole;
		switch (role) {
			case 'Business Owner':
				ROLE_OPTIONS.filter((val) => val.value !== 'Business Owner');
				break;
			case 'Admin':
				ROLE_OPTIONS.filter((val) => val.value !== 'Business Owner' && val.value !== 'Admin');
				break;
		}
	});
</script>

<div class="flex flex-col">
	<form use:enhance class="flex flex-col gap-4">
		<h2 class="text-sm font-semibold text-muted-foreground">Main Details</h2>
		<Separator />
		<FieldGroup>
			<div class="grid grid-cols-2 gap-4">
				<Field>
					<FieldLabel>First name</FieldLabel>
					<Input
						bind:value={$form.firstName}
						placeholder={user.name.firstName || 'Enter first name'}
					/>
					<FieldError errors={$errors.firstName?.map((e) => ({ message: e }))} />
				</Field>
				<Field>
					<FieldLabel>Last name</FieldLabel>
					<Input
						bind:value={$form.lastName}
						placeholder={user.name.lastName || 'Enter last name'}
					/>
					<FieldError errors={$errors.lastName?.map((e) => ({ message: e }))} />
				</Field>
			</div>

			<Field>
				<FieldLabel>Phone number</FieldLabel>
				<div class="flex gap-2">
					<Select.Root type="single" bind:value={countryCode} bind:open={countryCodeSelect}>
						<Select.Trigger
							>{countryCode.length > 0
								? countryCode
								: initialCode
									? initialCode
									: '+1'}</Select.Trigger
						>
						<Select.Content class="max-h-60 overflow-y-auto">
							{#each COUNTRY_CODES as cc (cc.code)}
								<Select.Item value={cc.code}>
									{cc.code}
									{cc.country}
								</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
					<Input
						bind:value={$form.phone}
						placeholder={initialNumber || 'Enter phone number'}
						class="flex-1"
					/>
				</div>
			</Field>
		</FieldGroup>

		<h2 class="text-sm font-semibold text-muted-foreground">Account information</h2>
		<Separator />

		<div class="flex flex-col gap-3">
			<!-- Email (locked) -->
			<div class="flex items-center gap-3">
				<Mail size={16} class="shrink-0 text-muted-foreground" />
				<Input value={user.email} disabled class="flex-1 opacity-60" />
				<LockUp size={14} class="shrink-0 text-muted-foreground" />
			</div>

			<!-- Role (editable for privileged users editing others) -->
			{#if canChangeRole}
				<div class="flex items-center gap-3">
					<span class="shrink-0 text-sm text-muted-foreground">Role</span>
					<Select.Root type="single" bind:value={selectedRole} bind:open={roleSelectOpen}>
						<Select.Trigger class="flex-1">
							<div class="flex items-center gap-2">
								<span
									class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium {ROLE_STYLES[
										selectedRole
									]}"
								>
									{selectedRole}
								</span>
							</div>
						</Select.Trigger>
						<Select.Content class="max-h-60 overflow-y-auto">
							{#each ROLE_OPTIONS as opt (opt.value)}
								<Select.Item value={opt.value}>
									<div class="flex items-center gap-2">
										<span
											class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium {ROLE_STYLES[
												opt.value
											]}"
										>
											{opt.label}
										</span>
									</div>
								</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>
			{:else}
				<div class="flex items-center gap-3">
					<User size={16} class="shrink-0 text-muted-foreground" />
					<Input
						value={user.role}
						disabled
						class="flex-1 opacity-60 {ROLE_STYLES[user.role || 'Business Owner']} "
					/>
					<LockUp size={14} class="shrink-0 text-muted-foreground" />
				</div>
			{/if}
		</div>

		<div class="flex justify-end gap-2 pt-2">
			<Button variant="ghost" type="button" onclick={close} disabled={isSaving}>Cancel</Button>
			<Button type="submit" disabled={isSaving || !isDirty}>
				{isSaving ? 'Saving...' : 'Save'}
			</Button>
		</div>
	</form>
</div>
