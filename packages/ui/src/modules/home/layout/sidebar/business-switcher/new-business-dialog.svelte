<script lang="ts">
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Field, FieldGroup, FieldLabel, FieldError } from '$lib/components/ui/field/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { createMutation, createQuery } from '@tanstack/svelte-query';
	import type {
		BaseErrorResponse,
		BusinessIndustry,
		InviteUserInput,
		InviteUserResponse,
		RegisterBusinessInput,
		RegisterBusinessResponse
	} from '@pikslots/shared';
	import type { AxiosError } from 'axios';
	import { toast } from 'svelte-sonner';
	import { registerBusiness } from '../../../../api/business/register.business.mutation';
	import { inviteUser } from '../../../../api/user/invite.user.mutation';
	import { getUsersByRoleQueryOptions } from '../../../../api/user/get.users.by.role.query';

	let { open = $bindable(false) }: { open: boolean } = $props();

	let step = $state<1 | 2>(1);
	//
	const businessOwnersQuery = createQuery(() =>
		getUsersByRoleQueryOptions({ role: 'Business Owner' })
	);

	// Step 1 — invite business owner
	let username = $state('');
	let email = $state('');
	let firstName = $state('');
	let lastName = $state('');
	let phone = $state('');

	// Step 2 — create business
	let ownerId = $state('');
	let businessName = $state('');
	let slug = $state('');
	let industry = $state<BusinessIndustry | ''>('');
	let defaultTimeZone = $state('');

	const INDUSTRIES: { value: BusinessIndustry; label: string }[] = [
		{ value: 'salon_and_beauty', label: 'Salon & Beauty' },
		{ value: 'health_and_wellness', label: 'Health & Wellness' },
		{ value: 'fitness', label: 'Fitness' },
		{ value: 'medical', label: 'Medical' },
		{ value: 'education', label: 'Education' },
		{ value: 'legal', label: 'Legal' },
		{ value: 'financial', label: 'Financial' },
		{ value: 'hospitality', label: 'Hospitality' },
		{ value: 'retail', label: 'Retail' },
		{ value: 'other', label: 'Other' }
	];

	// Auto-generate slug from business name
	$effect(() => {
		if (businessName) {
			slug = businessName
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, '-')
				.replace(/^-|-$/g, '');
		}
	});

	const inviteMutation = createMutation<
		InviteUserResponse,
		AxiosError<BaseErrorResponse>,
		InviteUserInput
	>(() => ({
		mutationFn: inviteUser
	}));

	const registerMutation = createMutation<
		RegisterBusinessResponse,
		AxiosError<BaseErrorResponse>,
		RegisterBusinessInput
	>(() => ({
		mutationFn: registerBusiness
	}));

	$effect(() => {
		if (inviteMutation.isSuccess) {
			toast.success('Business owner invited successfully');
			step = 2;
		}
		if (inviteMutation.isError) {
			toast.error(inviteMutation.error?.response?.data?.message ?? 'Failed to invite user');
		}
	});

	$effect(() => {
		if (registerMutation.isSuccess) {
			toast.success('Business created successfully');
			open = false;
			resetForm();
		}
		if (registerMutation.isError) {
			toast.error(registerMutation.error?.response?.data?.message ?? 'Failed to create business');
		}
	});

	function handleInvite() {
		inviteMutation.mutate({
			username,
			email,
			name: { firstName, lastName },
			role: 'Business Owner',
			...(phone ? { phone } : {})
		});
	}

	function handleRegister() {
		if (!industry) return;
		registerMutation.mutate({
			ownerId,
			slug,
			name: businessName,
			industry,
			...(defaultTimeZone ? { defaultTimeZone } : {})
		});
	}

	function resetForm() {
		step = 1;
		username = '';
		email = '';
		firstName = '';
		lastName = '';
		phone = '';
		ownerId = '';
		businessName = '';
		slug = '';
		industry = '';
		defaultTimeZone = '';
		inviteMutation.reset();
		registerMutation.reset();
	}
</script>

<Sheet.Root
	bind:open
	onOpenChange={(v) => {
		if (!v) resetForm();
	}}
>
	<Sheet.Content side="top" class="mx-auto my-12 flex w-full flex-col gap-0 sm:max-w-lg">
		<Sheet.Header class="px-6 pt-6">
			<Sheet.Title>New Business</Sheet.Title>
			<Sheet.Description>
				{step === 1
					? 'Invite the business owner first, then set up their business.'
					: 'Create the business and assign it to the invited owner.'}
			</Sheet.Description>
		</Sheet.Header>

		<!-- Stepper -->
		<div class="flex items-center gap-3 px-6 py-5">
			<div class="flex items-center gap-2">
				<div
					class="flex size-7 items-center justify-center rounded-full text-xs font-semibold
					{step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}"
				>
					1
				</div>
				<span
					class="text-sm font-medium {step === 1 ? 'text-foreground' : 'text-muted-foreground'}"
				>
					Invite Owner
				</span>
			</div>

			<div class="h-px flex-1 bg-border"></div>

			<div class="flex items-center gap-2">
				<div
					class="flex size-7 items-center justify-center rounded-full text-xs font-semibold
					{step === 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}"
				>
					2
				</div>
				<span
					class="text-sm font-medium {step === 2 ? 'text-foreground' : 'text-muted-foreground'}"
				>
					Create Business
				</span>
			</div>
		</div>

		<Separator />

		<!-- Step 1: Invite Business Owner -->
		{#if step === 1}
			<div class="flex flex-1 flex-col gap-4 overflow-y-auto px-6 py-5">
				<FieldGroup>
					<div class="grid grid-cols-2 gap-4">
						<Field>
							<FieldLabel>First name</FieldLabel>
							<Input bind:value={firstName} placeholder="John" />
						</Field>
						<Field>
							<FieldLabel>Last name</FieldLabel>
							<Input bind:value={lastName} placeholder="Doe" />
						</Field>
					</div>

					<Field>
						<FieldLabel>Username</FieldLabel>
						<Input bind:value={username} placeholder="john_doe" />
					</Field>

					<Field>
						<FieldLabel>Email</FieldLabel>
						<Input bind:value={email} type="email" placeholder="john@example.com" />
					</Field>

					<Field>
						<FieldLabel>
							Phone
							<span class="ml-1 text-xs text-muted-foreground">(optional)</span>
						</FieldLabel>
						<Input bind:value={phone} type="tel" placeholder="+12025551234" />
					</Field>
				</FieldGroup>
			</div>

			<div class="border-t px-6 py-4">
				<Button
					class="w-full"
					onclick={handleInvite}
					disabled={inviteMutation.isPending || !username || !email || !firstName || !lastName}
				>
					{inviteMutation.isPending ? 'Inviting...' : 'Invite & Continue'}
				</Button>
			</div>
		{/if}

		<!-- Step 2: Create Business -->
		{#if step === 2}
			<div class="flex flex-1 flex-col gap-4 overflow-y-auto px-6 py-5">
				<FieldGroup>
					<Field>
						<FieldLabel>Business owner</FieldLabel>
						<Select.Root
							type="single"
							bind:value={ownerId}
							disabled={businessOwnersQuery.isPending}
						>
							<Select.Trigger class="w-full">
								{#if businessOwnersQuery.isPending}
									Loading owners...
								{:else}
									{(() => {
										const u = businessOwnersQuery.data?.find((o) => o.id === ownerId);
										return u
											? `${u.name.firstName} ${u.name.lastName} (${u.username})`
											: 'Select a business owner';
									})()}
								{/if}
							</Select.Trigger>
							<Select.Content>
								{#each businessOwnersQuery.data ?? [] as owner (owner.id)}
									<Select.Item value={owner.id}>
										{owner.name.firstName}
										{owner.name.lastName}
										<span class="ml-1 text-xs text-muted-foreground">({owner.username})</span>
									</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					</Field>

					<Field>
						<FieldLabel>Business name</FieldLabel>
						<Input bind:value={businessName} placeholder="Joe's Barbershop" />
					</Field>

					<Field>
						<FieldLabel>Slug</FieldLabel>
						<Input bind:value={slug} placeholder="joes-barbershop" />
					</Field>

					<Field>
						<FieldLabel>Industry</FieldLabel>
						<Select.Root type="single" bind:value={industry}>
							<Select.Trigger class="w-full">
								{INDUSTRIES.find((i) => i.value === industry)?.label ?? 'Select an industry'}
							</Select.Trigger>
							<Select.Content>
								{#each INDUSTRIES as item (item.value)}
									<Select.Item value={item.value}>{item.label}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					</Field>

					<Field>
						<FieldLabel>
							Default timezone
							<span class="ml-1 text-xs text-muted-foreground">(optional)</span>
						</FieldLabel>
						<Input bind:value={defaultTimeZone} placeholder="America/New_York" />
					</Field>
				</FieldGroup>
			</div>

			<div class="flex gap-3 border-t px-6 py-4">
				<Button variant="outline" class="flex-1" onclick={() => (step = 1)}>Back</Button>
				<Button
					class="flex-1"
					onclick={handleRegister}
					disabled={registerMutation.isPending || !ownerId || !businessName || !slug || !industry}
				>
					{registerMutation.isPending ? 'Creating...' : 'Create Business'}
				</Button>
			</div>
		{/if}
	</Sheet.Content>
</Sheet.Root>
