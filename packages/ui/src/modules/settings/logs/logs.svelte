<script lang="ts">
	import * as Select from '$lib/components/ui/select/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
	import { createQuery } from '@tanstack/svelte-query';
	import { businessStore } from '$stores/business.svelte';
	import { getAuditLogsQueryOptions } from '../../api/audit-log/get.audit.logs.query';
	import type { AuditLogModel } from '../../api/audit-log/models/audit-log-model';
	import { formatIsoInTimezone } from '@pikslots/datetime';
	import { getLocalTimeZone } from '@internationalized/date';
	import Search from '@tabler/icons-svelte/icons/search';

	// ── State ─────────────────────────────────────────────────────────────────

	let search = $state('');
	let entityTypeFilter = $state('all');
	let actionFilter = $state('all');

	// ── Queries ───────────────────────────────────────────────────────────────

	const auditLogsQuery = createQuery(() => ({
		...getAuditLogsQueryOptions({ businessId: businessStore.selectedBusiness?.id ?? '' }),
		enabled: !!businessStore.selectedBusiness?.id
	}));

	// ── Derived ───────────────────────────────────────────────────────────────

	const timezone = $derived(
		businessStore.selectedBusiness?.locationDetails.timeZone || getLocalTimeZone()
	);
	const logs = $derived(auditLogsQuery.data ?? []);

	function humanizeAction(action: string): string {
		return action
			.replace(/^audit\.log\./, '')
			.split('.')
			.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
			.join(' ');
	}

	function titleCase(value: string): string {
		return value.charAt(0).toUpperCase() + value.slice(1);
	}

	const entityTypeOptions = $derived([
		{ value: 'all', label: 'All types' },
		...Array.from(new Set(logs.map((log) => log.entityType))).map((type) => ({
			value: type,
			label: titleCase(type)
		}))
	]);

	const actionOptions = $derived([
		{ value: 'all', label: 'All actions' },
		...Array.from(new Set(logs.map((log) => log.action))).map((action) => ({
			value: action,
			label: humanizeAction(action)
		}))
	]);

	const filteredLogs = $derived(
		logs.filter((log) => {
			if (entityTypeFilter !== 'all' && log.entityType !== entityTypeFilter) return false;
			if (actionFilter !== 'all' && log.action !== actionFilter) return false;
			if (search && !log.description.toLowerCase().includes(search.toLowerCase())) return false;
			return true;
		})
	);

	type LogGroup = { dateLabel: string; entries: AuditLogModel[] };

	const groupedLogs = $derived.by((): LogGroup[] => {
		const groups: LogGroup[] = [];
		for (const log of filteredLogs) {
			const dateLabel = formatIsoInTimezone(
				log.occurredAt as unknown as string,
				timezone,
				'EEE d MMM yyyy'
			);
			const lastGroup = groups[groups.length - 1];
			if (lastGroup && lastGroup.dateLabel === dateLabel) {
				lastGroup.entries.push(log);
			} else {
				groups.push({ dateLabel, entries: [log] });
			}
		}
		return groups;
	});

	function formatTime(log: AuditLogModel): string {
		return formatIsoInTimezone(log.occurredAt as unknown as string, timezone, 'h:mm a');
	}

	function actorInitial(log: AuditLogModel): string {
		return log.userType === 'system' ? 'S' : 'U';
	}

	function actorLabel(log: AuditLogModel): string {
		return log.userType === 'system' ? 'System' : 'User';
	}
</script>

<div class="flex h-full flex-col">
	<!-- Page header -->
	<div class="border-b px-6 py-4">
		<h1 class="text-base font-semibold">Activity</h1>
		<p class="text-xs text-muted-foreground">View your most recent account activity.</p>
	</div>

	<div class="flex flex-1 flex-col gap-4 overflow-hidden px-6 py-4">
		<!-- Filters row -->
		<div class="flex items-center gap-3">
			<div class="relative flex-1">
				<Input
					bind:value={search}
					placeholder="Search activity"
					class="pl-9 text-xs"
					disabled={!businessStore.selectedBusiness?.id}
				/>
				<Search size={14} class="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground" />
			</div>

			<Select.Root type="single" bind:value={entityTypeFilter}>
				<Select.Trigger class="w-40 text-xs">
					{entityTypeOptions.find((o) => o.value === entityTypeFilter)?.label}
				</Select.Trigger>
				<Select.Content>
					{#each entityTypeOptions as option (option.value)}
						<Select.Item value={option.value}>{option.label}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>

			<Select.Root type="single" bind:value={actionFilter}>
				<Select.Trigger class="w-48 text-xs">
					{actionOptions.find((o) => o.value === actionFilter)?.label}
				</Select.Trigger>
				<Select.Content>
					{#each actionOptions as option (option.value)}
						<Select.Item value={option.value}>{option.label}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		</div>

		<!-- Content -->
		<ScrollArea class="min-h-0 flex-1">
			{#if auditLogsQuery.isPending}
				<div class="flex flex-col gap-3 pr-4">
					{#each Array(6) as _, i (i)}
						<div class="flex items-center gap-3">
							<Skeleton class="h-4 w-14" />
							<Skeleton class="size-6 rounded-full" />
							<Skeleton class="h-4 flex-1" />
						</div>
					{/each}
				</div>
			{:else if auditLogsQuery.isError}
				<div class="flex flex-col items-center justify-center gap-1 py-32 text-center">
					<span class="text-xs font-semibold">Failed to load activity</span>
					<span class="text-xs text-muted-foreground">Please try again later.</span>
				</div>
			{:else if groupedLogs.length === 0}
				<div class="flex flex-col items-center justify-center gap-1 py-32 text-center">
					<span class="text-xs font-semibold">No activity yet</span>
					<span class="text-xs text-muted-foreground">
						Activity on your account will show up here.
					</span>
				</div>
			{:else}
				<div class="flex flex-col gap-6 pr-4 pb-4">
					{#each groupedLogs as group (group.dateLabel)}
						<div class="flex flex-col gap-2">
							<h2 class="text-sm font-semibold">{group.dateLabel}</h2>
							<div class="flex flex-col">
								{#each group.entries as log (log.id)}
									<div class="flex items-start gap-3 border-b py-2.5 last:border-b-0">
										<span class="w-16 shrink-0 pt-0.5 text-xs text-muted-foreground"
											>{formatTime(log)}</span
										>
										<Avatar.Root size="sm" class="shrink-0">
											<Avatar.Fallback>{actorInitial(log)}</Avatar.Fallback>
										</Avatar.Root>
										<span class="w-14 shrink-0 pt-0.5 text-xs text-muted-foreground"
											>{actorLabel(log)}</span
										>
										<p class="flex-1 pt-0.5 text-xs">
											<span class="font-medium">{humanizeAction(log.action)}</span>
											<span class="text-muted-foreground">— {log.description}</span>
										</p>
									</div>
								{/each}
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</ScrollArea>
	</div>
</div>
