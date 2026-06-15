<script lang="ts">
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import Pencil from '@tabler/icons-svelte/icons/pencil';
	import Plus from '@tabler/icons-svelte/icons/plus';
	import Search from '@tabler/icons-svelte/icons/search';
	import InviteTeamMemberDialog from './dialog/invite-team-member-dialog.svelte';
	import { createQuery } from '@tanstack/svelte-query';
	import { getUsersInsideBusinessQueryOptions } from '../../api/user/get.users.inside.business.query';
	import { authStore } from '$stores/auth.svelte';
	import { businessStore } from '$stores/business.svelte';
	import AboutTab from './tabs/about.svelte';
	import IntegrationsTab from './tabs/integrations.svelte';
	import ServicesTab from './tabs/services.svelte';
	import WorkingHoursTab from './tabs/working-hours.svelte';
	import BreaksTab from './tabs/breaks.svelte';
	import TimeOffTab from './tabs/timeoff.svelte';
	import UpdatesTab from './tabs/updates.svelte';

	let inviteOpen = $state(false);

	const usersQuery = createQuery(() => ({
		...getUsersInsideBusinessQueryOptions(businessStore.selectedBusiness?.id ?? ''),
		enabled: !!businessStore.selectedBusiness?.id
	}));

	const members = $derived(usersQuery.data ?? []);
	const currentUserId = $derived(authStore.getPayloadData()?.userId);

	$effect(() => {
		businessStore.selectedBusiness?.id;
		selectedId = null;
	});

	let search = $state('');
	let selectedId = $state<string | null>(null);

	const selected = $derived(members.find((m) => m.id === selectedId) ?? members[0] ?? null);

	const filtered = $derived(
		members.filter((m) =>
			`${m.name.firstName} ${m.name.lastName}`.toLowerCase().includes(search.toLowerCase())
		)
	);
</script>

<InviteTeamMemberDialog bind:open={inviteOpen} />

<div class="flex h-full min-h-0 flex-1">
	<!-- Left: team list -->
	<div class="flex w-64 shrink-0 flex-col border-r">
		<div class="flex items-center justify-between border-b px-4 py-3">
			<span class="text-sm font-semibold">Your team</span>
			<Button
				size="icon-sm"
				class="cursor-pointer rounded-full"
				onclick={() => (inviteOpen = true)}
			>
				<Plus size={16} />
			</Button>
		</div>

		<!-- Search -->
		<div class="px-3 py-2">
			<div class="relative">
				<Search
					size={14}
					class="absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground"
				/>
				<Input bind:value={search} placeholder="Search" class="pl-8 text-xs" />
			</div>
		</div>

		<!-- Members -->
		<div class="flex flex-col">
			{#if usersQuery.isPending}
				<p class="px-4 py-3 text-xs text-muted-foreground">Loading...</p>
			{:else}
				{#each filtered as member (member.id)}
					<button
						type="button"
						onclick={() => (selectedId = member.id)}
						class="flex items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-accent
							{selectedId === member.id ? 'bg-accent' : ''}"
					>
						<div class="relative">
							<Avatar.Root class="size-8 text-xs">
								<Avatar.Fallback class="bg-muted font-medium text-foreground">
									{member.name.firstName[0].toUpperCase()}
								</Avatar.Fallback>
							</Avatar.Root>
							<span
								class="absolute right-0 bottom-0 size-2 rounded-full bg-green-500 ring-1 ring-background"
							></span>
						</div>
						<div class="flex flex-1 flex-col overflow-hidden">
							<span class="truncate text-xs font-medium">
								{member.name.firstName}
								{member.name.lastName}
							</span>
							<span class="truncate text-xs text-muted-foreground">{member.role}</span>
						</div>
						{#if member.id === currentUserId}
							<Badge variant="secondary" class="shrink-0 text-xs">You</Badge>
						{/if}
					</button>
				{/each}
			{/if}
		</div>
	</div>

	<!-- Right: member detail -->
	<div class="flex flex-1 flex-col">
		{#if selected}
			<div class="relative flex items-center gap-4 px-6 py-5">
				<Avatar.Root class="size-16 text-lg">
					<Avatar.Fallback class="bg-muted font-semibold text-foreground">
						{selected.name.firstName[0].toUpperCase()}
					</Avatar.Fallback>
				</Avatar.Root>
				<div class="flex flex-col gap-0.5">
					<span class="text-base font-semibold">
						{selected.name.firstName}
						{selected.name.lastName}
					</span>
					<span class="text-xs text-muted-foreground">@{selected.username}</span>
				</div>
				<Button variant="ghost" size="icon-sm" class="absolute top-4 right-4">
					<Pencil size={16} />
				</Button>
			</div>

			<Tabs.Root value="about" class="flex flex-col">
				<Tabs.List
					variant="line"
					class="h-auto justify-start rounded-none bg-transparent px-6 pb-0"
				>
					<Tabs.Trigger
						value="about"
						class="cursor-pointer rounded-none border-b-2 border-transparent px-3 pt-0 pb-2 text-muted-foreground  "
					>
						About
					</Tabs.Trigger>
					<Tabs.Trigger
						value="integrations"
						class="cursor-pointer rounded-none border-b-2 border-transparent px-3 pt-0 pb-2 text-muted-foreground "
					>
						Integrations
					</Tabs.Trigger>
					<Tabs.Trigger
						value="services"
						class="cursor-pointer rounded-none border-b-2 border-transparent px-3 pt-0 pb-2 text-muted-foreground "
					>
						Services
					</Tabs.Trigger>
					<Tabs.Trigger
						value="working-hours"
						class="cursor-pointer rounded-none border-b-2 border-transparent px-3 pt-0 pb-2 text-muted-foreground"
					>
						Working hours
					</Tabs.Trigger>
					<Tabs.Trigger
						value="breaks"
						class="cursor-pointer rounded-none border-b-2 border-transparent px-3 pt-0 pb-2 text-muted-foreground"
					>
						Breaks
					</Tabs.Trigger>
					<Tabs.Trigger
						value="time-off"
						class="cursor-pointer rounded-none border-b-2 border-transparent px-3 pt-0 pb-2 text-muted-foreground"
					>
						Time off
					</Tabs.Trigger>
					<Tabs.Trigger
						value="updates"
						class="cursor-pointer rounded-none border-b-2 border-transparent px-3 pt-0 pb-2 text-muted-foreground"
					>
						Updates
					</Tabs.Trigger>
				</Tabs.List>

				<Tabs.Content value="about" class="mt-0">
					<AboutTab user={selected} />
				</Tabs.Content>

				<Tabs.Content value="integrations" class="mt-0">
					<IntegrationsTab />
				</Tabs.Content>

				<Tabs.Content value="services" class="mt-0">
					<ServicesTab />
				</Tabs.Content>

				<Tabs.Content value="working-hours" class="mt-0">
					<WorkingHoursTab userWorkingHours={selected.userWorkingHours} userId={selected.id} />
				</Tabs.Content>

				<Tabs.Content value="breaks" class="mt-0">
					<BreaksTab userWorkingHours={selected.userWorkingHours} />
				</Tabs.Content>

				<Tabs.Content value="time-off" class="mt-0">
					<TimeOffTab />
				</Tabs.Content>

				<Tabs.Content value="updates" class="mt-0">
					<UpdatesTab />
				</Tabs.Content>
			</Tabs.Root>
		{:else}
			<div class="flex flex-1 items-center justify-center text-xs text-muted-foreground">
				Select a team member to view details.
			</div>
		{/if}
	</div>
</div>
