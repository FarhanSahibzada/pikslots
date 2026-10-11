<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { createMutation, useQueryClient } from '@tanstack/svelte-query';
	import { toast } from 'svelte-sonner';
	import { superForm } from 'sveltekit-superforms';
	import { zod4 as zod } from 'sveltekit-superforms/adapters';
	import z from 'zod';
	import { updateUserProfileMutationOptions } from '../../../api/user/update.user.profile.mutation';
	import type { UserSummary } from '@pikslots/shared';
	import XIcon from '@lucide/svelte/icons/x';
	import Lock from '@tabler/icons-svelte/icons/lock';
	import Phone from '@tabler/icons-svelte/icons/phone';
	import Mail from '@tabler/icons-svelte/icons/mail';
	import Qrcode from '@tabler/icons-svelte/icons/qrcode';
	import UserIcon from '@tabler/icons-svelte/icons/user';

	let {
		open = $bindable(false),
		user
	}: {
		open: boolean;
		user: UserSummary | undefined;
	} = $props();

	const queryClient = useQueryClient();
	const updateProfileMutation = createMutation(() => updateUserProfileMutationOptions());

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

	const ProfileSchema = z.object({
		firstName: z.string().min(1, 'First name is required'),
		lastName: z.string().min(1, 'Last name is required'),
		phone: z.string().optional()
	});

	let countryCode = $state('+92');
	let countryCodeSelect = $state(false);
	let formReady = $state(false);

	const { form, errors, enhance } = superForm(
		{ firstName: '', lastName: '', phone: '' },
		{
			validators: zod(ProfileSchema),
			SPA: true,
			resetForm: false,
			onUpdate({ form }) {
				if (form.valid && user) {
					const phone = form.data.phone ? `${countryCode} ${form.data.phone}` : undefined;
					updateProfileMutation.mutate({
						firstName: form.data.firstName,
						lastName: form.data.lastName,
						phone,
						email: user.email
					});
				}
			}
		}
	);

	$effect(() => {
		if (user && !formReady) {
			const { code, number } = parsePhone(user.phone);
			countryCode = code;
			$form.firstName = user.name.firstName;
			$form.lastName = user.name.lastName;
			$form.phone = number;
			formReady = true;
		}
	});
	let isDirty = $derived.by(() => {
		if (!user) return false;
		const { number } = parsePhone(user.phone);

		return (
			$form.firstName !== user.name.firstName ||
			$form.lastName !== user.name.lastName ||
			$form.phone !== number
		);
	});

	const isSaving = $derived(updateProfileMutation.isPending);

	const fullName = $derived(user ? `${user.name.firstName} ${user.name.lastName}` : '');
	const initials = $derived(user ? `${user.name.firstName[0]}${user.name.lastName[0]}` : '');

	$effect(() => {
		if (updateProfileMutation.isSuccess) {
			queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
			toast.success('Profile updated successfully');
			open = false;
			formReady = false;
		}
		if (updateProfileMutation.isError) {
			toast.error(
				updateProfileMutation.error?.response?.data?.message ?? 'Failed to update profile'
			);
		}
	});

	function close() {
		open = false;
		formReady = false;
		updateProfileMutation.reset();
	}
</script>

<Dialog.Root
	bind:open
	onOpenChange={(v) => {
		if (!v) close();
	}}
>
	<Dialog.Content
		class="flex max-h-[85vh] w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-lg"
		showCloseButton={false}
	>
		<!-- Header -->
		<div class="flex items-center justify-between px-6 py-4">
			<span class="text-base font-semibold">Edit profile</span>
			<Dialog.Close>
				{#snippet child({ props })}
					<Button variant="ghost" size="icon-sm" {...props}>
						<XIcon />
						<span class="sr-only">Close</span>
					</Button>
				{/snippet}
			</Dialog.Close>
		</div>

		<Separator />

		<!-- Body -->
		<div
			class="scrollbar dark:scrollbar-track-dark light:scrollbar-track-gray-200 flex flex-1 scrollbar-thin scrollbar-thumb-gray-500 flex-col overflow-y-auto px-6 py-5"
		>
			{#if user}
				<!-- Avatar (read-only) -->
				<div class="flex items-center gap-4 pb-5">
					<Avatar.Root class="size-16 text-lg">
						<Avatar.Image src={user.avatarUrl ?? ''} alt={fullName} />
						<Avatar.Fallback class="bg-muted font-semibold text-foreground">
							{initials}
						</Avatar.Fallback>
					</Avatar.Root>
					<div class="flex flex-col gap-0.5">
						<span class="text-sm font-semibold">{fullName}</span>
						<span class="text-xs text-muted-foreground">{user.role}</span>
					</div>
				</div>

				<Separator class="mb-5" />

				<!-- Editable fields -->
				<form use:enhance class="flex flex-col gap-4">
					<p class="text-xs font-medium text-muted-foreground">Personal information</p>

					<div class="flex flex-col gap-3">
						<!-- First name -->
						<div class="flex items-center gap-3">
							<UserIcon size={16} class="shrink-0 text-muted-foreground" />
							<Input bind:value={$form.firstName} placeholder="Enter first name" class="flex-1" />
						</div>
						{#if $errors.firstName}
							<p class="ml-7 text-xs text-destructive">{$errors.firstName[0]}</p>
						{/if}

						<!-- Last name -->
						<div class="flex items-center gap-3">
							<UserIcon size={16} class="shrink-0 text-muted-foreground" />
							<Input bind:value={$form.lastName} placeholder="Enter last name" class="flex-1" />
						</div>
						{#if $errors.lastName}
							<p class="ml-7 text-xs text-destructive">{$errors.lastName[0]}</p>
						{/if}

						<!-- Phone -->
						<div class="flex items-center gap-3">
							<Phone size={16} class="shrink-0 text-muted-foreground" />
							<Select.Root type="single" bind:value={countryCode} bind:open={countryCodeSelect}>
								<Select.Trigger class="w-24 shrink-0">
									{countryCode || '+92'}
								</Select.Trigger>
								<Select.Content class="max-h-60 overflow-y-auto">
									{#each COUNTRY_CODES as cc (cc.code)}
										<Select.Item value={cc.code}>
											{cc.code}
											{cc.country}
										</Select.Item>
									{/each}
								</Select.Content>
							</Select.Root>
							<Input bind:value={$form.phone} placeholder="Enter phone number" class="flex-1" />
						</div>
					</div>

					<Separator class="my-1" />

					<!-- Read-only fields with lock icons -->
					<p class="text-xs font-medium text-muted-foreground">Account information</p>

					<div class="flex flex-col gap-3">
						<!-- Email -->
						<div class="flex items-center gap-3">
							<Mail size={16} class="shrink-0 text-muted-foreground" />
							<Input value={user.email} disabled class="flex-1 opacity-60" />
							<Lock size={14} class="shrink-0 text-muted-foreground" />
						</div>

						<!-- Role -->
						<div class="flex items-center gap-3">
							<UserIcon size={16} class="shrink-0 text-muted-foreground" />
							<Input value={user.role} disabled class="flex-1 opacity-60" />
							<Lock size={14} class="shrink-0 text-muted-foreground" />
						</div>

						<!-- Booking URL -->
						<div class="flex items-center gap-3">
							<Qrcode size={16} class="shrink-0 text-muted-foreground" />
							<Input value={user.bookingUrl} disabled class="flex-1 opacity-60" />
							<Lock size={14} class="shrink-0 text-muted-foreground" />
						</div>
					</div>

					<!-- Footer -->
					<div class="flex justify-end gap-2 pt-3">
						<Button variant="ghost" type="button" onclick={close} disabled={isSaving}>
							Cancel
						</Button>
						<Button type="submit" disabled={!isDirty}>
							{isSaving ? 'Saving...' : 'Save'}
						</Button>
					</div>
				</form>
			{/if}
		</div>
	</Dialog.Content>
</Dialog.Root>
