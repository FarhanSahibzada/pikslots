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
	import type { UserSummary } from '@pikslots/shared';
	import LockUp from '@tabler/icons-svelte/icons/lock-up';
	import Separator from '$lib/components/ui/separator/separator.svelte';

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
					updateProfileMutation.mutate({
						firstName: form.data.firstName,
						lastName: form.data.lastName,
						phone,
						email: form.data.email
					});
				}
			}
		}
	);

	let countryCode = $state('');
	let countryCodeSelect = $state(false);

	const updateProfileMutation = createMutation(() => updateUserProfileMutationOptions());

	const isSaving = $derived(updateProfileMutation.isPending);
	const isDirty = $derived($tainted && Object.values($tainted).some((v) => v === true));

	$effect(() => {
		if (updateProfileMutation.isSuccess) {
			queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
			toast.success('Profile updated successfully');
			onClose();
		}
		if (updateProfileMutation.isError) {
			toast.error(updateProfileMutation.error?.response?.data?.message ?? 'Failed to update profile');
		}
	});

	function close() {
		updateProfileMutation.reset();
		onClose();
	}
</script>

<div class="flex flex-col">
	<form
		use:enhance
		class="flex flex-col gap-4"
	>
		<h2 class="text-sm font-semibold text-muted-foreground">Main Details</h2>
		<Separator />
		<FieldGroup>
			<div class="grid grid-cols-2 gap-4">
				<Field>
					<FieldLabel>First name</FieldLabel>
					<Input
						bind:value={$form.firstName}
						placeholder={user.name.firstName || 'Enter your first name'}
					/>
					<FieldError errors={$errors.firstName?.map((e) => ({ message: e }))} />
				</Field>
				<Field>
					<FieldLabel>Last name</FieldLabel>
					<Input
						bind:value={$form.lastName}
						placeholder={user.name.lastName || 'Enter your last name'}
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
						placeholder={initialNumber || '2529955259'}
						class="flex-1"
					/>
				</div>
			</Field>

			<Field>
				<FieldLabel>Email</FieldLabel>
				<div class="relative">
					<Input bind:value={$form.email} type="email" placeholder={user.email} disabled />
					<span class="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground">
						<LockUp size={16} />
					</span>
				</div>
				<FieldError errors={$errors.email?.map((e) => ({ message: e }))} />
			</Field>
		</FieldGroup>

		<div class="flex justify-end gap-2 pt-2">
			<Button variant="ghost" type="button" onclick={close} disabled={isSaving}>Cancel</Button>
			<Button type="submit" disabled={isSaving || !isDirty}>
				{isSaving ? 'Saving...' : 'Save'}
			</Button>
		</div>
	</form>
</div>
