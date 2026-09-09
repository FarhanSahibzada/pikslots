<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { createMutation, useQueryClient } from '@tanstack/svelte-query';
	import { toast } from 'svelte-sonner';
	import type { UserSummary } from '@pikslots/shared';
	import { uploadAvatarMutationOptions } from '../../../api/s3/upload.avatar.mutation';
	import { updateUserAvatarMutationOptions } from '../../../api/user/update.user.avatar.mutation';
	import { businessStore } from '$stores/business.svelte';
	import AboutEdit from './tabs/about-edit.svelte';
	import WorkingHoursEdit from './tabs/working-hours-edit.svelte';
	import BreaksEdit from './tabs/breaks-edit.svelte';
	import TimeoffEdit from './tabs/timeoff-edit.svelte';
	import LoginSecurity from '../../profile/dialog/tabs/login-security.svelte';
	import XIcon from '@lucide/svelte/icons/x';
	import ImageUp from '@tabler/icons-svelte/icons/image-in-picture';
	import AvatarCropperDialog from '../../profile/dialog/avatar-cropper-dialog.svelte';
	import { AxiosError } from 'axios';

	let {
		open = $bindable(false),
		user,
		businessId
	}: {
		open: boolean;
		user: UserSummary | undefined;
		businessId: string;
	} = $props();

	const queryClient = useQueryClient();
	const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
	const MAX_SIZE_MB = 10;

	type Tab = 'about' | 'working-hours' | 'breaks' | 'time-off' | 'login-security';

	let activeTab = $state<Tab>('about');
	let cropperOpen = $state(false);
	let cropperFile = $state<File | null>(null);
	let cropperPreviewUrl = $state<string | null>(null);
	let fileInput: HTMLInputElement | undefined = $state();

	const uploadMutation = createMutation(() => uploadAvatarMutationOptions());
	const updateAvatarMutation = createMutation(() => updateUserAvatarMutationOptions());

	const isUploading = $derived(uploadMutation.isPending || updateAvatarMutation.isPending);

	const tabs: { value: Tab; label: string }[] = [
		{ value: 'about', label: 'About' },
		{ value: 'working-hours', label: 'Working hours' },
		{ value: 'breaks', label: 'Breaks' },
		{ value: 'time-off', label: 'Time off' },
		{ value: 'login-security', label: 'Login & security' }
	];

	const fullName = $derived(user ? `${user.name.firstName} ${user.name.lastName}` : '');
	const initials = $derived(user ? `${user.name.firstName[0]}${user.name.lastName[0]}` : '');

	function onFileChange(e: Event) {
		const input = e.currentTarget as HTMLInputElement;
		const selected = input.files?.[0];
		if (!selected) return;

		if (!ACCEPTED_TYPES.includes(selected.type)) {
			toast.error('Only JPG, JPEG and PNG files are allowed');
			return;
		}
		if (selected.size > MAX_SIZE_MB * 1024 * 1024) {
			toast.error(`File must be under ${MAX_SIZE_MB}MB`);
			return;
		}

		cropperFile = selected;
		cropperPreviewUrl = URL.createObjectURL(selected);
		cropperOpen = true;
		input.value = '';
	}

	async function handleAvatarSave(croppedFile: File) {
		try {
			if (isUploading || !user || !businessStore.selectedBusiness?.slug) return;

			const avatarKey = await uploadMutation.mutateAsync({
				id: user.id,
				folder: 'user',
				file: croppedFile,
				businessSlug: businessStore.selectedBusiness.slug,
				type: 'avatar'
			});

			await updateAvatarMutation.mutateAsync({
				userId: user.id,
				avatarKey
			});

			await queryClient.invalidateQueries({ queryKey: ['users-inside-business', businessId] });
			toast.success('Avatar updated successfully');
		} catch (error) {
			if (error instanceof AxiosError) {
				toast.error(
					uploadMutation.error?.response?.data.message ??
						updateAvatarMutation.error?.response?.data.message ??
						error?.message ??
						'Something went wrong'
				);
			}
		}
	}

	function close() {
		uploadMutation.reset();
		updateAvatarMutation.reset();
		cropperFile = null;
		cropperPreviewUrl = null;
		open = false;
		activeTab = 'about';
	}
</script>

<Dialog.Root
	bind:open
	onOpenChange={(v) => {
		if (!v) close();
	}}
>
	<Dialog.Content
		class="flex h-[85vh] w-full flex-col gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-4xl"
		showCloseButton={false}
	>
		<!-- Header -->
		<div class="flex items-center justify-between px-6 py-4">
			<span class="text-base font-semibold">Edit team member</span>
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

		<!-- Body: horizontal layout -->
		<div class="flex flex-1 overflow-hidden">
			<!-- Left: avatar + vertical tabs -->
			<div class="flex w-52 shrink-0 flex-col border-r pt-4">
				{#if user}
					<div class="flex flex-col items-center gap-2 px-4 pb-4">
						<div class="relative">
							{#if cropperPreviewUrl}
								<div class="relative size-16 overflow-hidden rounded-full">
									<img src={cropperPreviewUrl} alt="Preview" class="h-full w-full object-cover" />
									<button
										type="button"
										onclick={() => fileInput?.click()}
										class="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity hover:opacity-100"
									>
										<ImageUp size={16} class="text-white" />
									</button>
								</div>
							{:else if user.avatarUrl}
								<div class="relative size-16 overflow-hidden rounded-full">
									<img src={user.avatarUrl} alt="Avatar" class="h-full w-full object-cover" />
									<button
										type="button"
										onclick={() => fileInput?.click()}
										class="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity hover:opacity-100"
									>
										<ImageUp size={16} class="text-white" />
									</button>
								</div>
							{:else}
								<button
									type="button"
									onclick={() => fileInput?.click()}
									class="flex size-16 cursor-pointer items-center justify-center rounded-full bg-muted transition-opacity hover:opacity-80"
								>
									<span class="text-xl font-semibold">{initials}</span>
								</button>
							{/if}
							<input
								bind:this={fileInput}
								type="file"
								accept=".jpg,.jpeg,.png"
								class="hidden"
								onchange={onFileChange}
							/>
						</div>
						<span class="text-sm font-medium">{fullName}</span>
					</div>
				{/if}

				<div class="flex flex-col px-2 pt-2">
					{#each tabs as tab (tab.value)}
						<button
							type="button"
							class="flex items-center px-4 py-2.5 text-left text-sm transition-colors
							{activeTab === tab.value
								? 'bg-muted font-medium text-foreground'
								: 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'}"
							onclick={() => (activeTab = tab.value)}
						>
							{tab.label}
						</button>
					{/each}
				</div>
			</div>

			<!-- Right: tab content -->
			<div
				class="scrollbar dark:scrollbar-track-dark light:scrollbar-track-gray-200 flex flex-1 scrollbar-thin scrollbar-thumb-gray-500 flex-col overflow-y-auto px-6 py-5"
			>
				{#if user}
					{#if activeTab === 'about'}
						<AboutEdit {user} onClose={close} />
					{:else if activeTab === 'working-hours'}
						<WorkingHoursEdit userWorkingHours={user.userWorkingHours} userId={user.id} />
					{:else if activeTab === 'breaks'}
						<BreaksEdit userWorkingHours={user.userWorkingHours} userId={user.id} {businessId} />
					{:else if activeTab === 'time-off'}
						<TimeoffEdit userId={user.id} {businessId} />
					{:else if activeTab === 'login-security'}
						<LoginSecurity />
					{/if}
				{/if}
			</div>
		</div>
	</Dialog.Content>
</Dialog.Root>

<AvatarCropperDialog
	bind:open={cropperOpen}
	bind:initialFile={cropperFile}
	bind:previewUrl={cropperPreviewUrl}
	onSave={handleAvatarSave}
	onClose={() => {
		cropperFile = null;
		cropperPreviewUrl = null;
	}}
/>
