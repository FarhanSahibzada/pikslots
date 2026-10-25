<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import PikslotEmpty from '$lib/components/pikslot-empty.svelte';
	import ArrowLeft from '@tabler/icons-svelte/icons/arrow-left';
	import Bell from '@tabler/icons-svelte/icons/bell';
	import { notificationsStore } from '$stores/notifications.svelte';
	import { formatFullTime, formatRelativeTime, notificationMeta } from './data';

	let { notificationId, onBack }: { notificationId: string; onBack: () => void } = $props();

	const notification = $derived(
		notificationsStore.notifications.find((item) => item.id === notificationId)
	);

	$effect(() => {
		notificationsStore.markAsRead(notificationId);
	});
</script>

<div class="mx-auto flex w-full max-w-3xl flex-col gap-5">
	<div>
		<Button variant="ghost" size="sm" class="-ml-2 gap-1.5" onclick={onBack}>
			<ArrowLeft class="size-4" />
			Back to notifications
		</Button>
	</div>

	{#if notification}
		{@const meta = notificationMeta[notification.kind]}
		<article class="overflow-hidden rounded-lg border bg-card">
			<header class="flex flex-col gap-4 border-b p-5 sm:p-6">
				<div class="flex items-start gap-3">
					<div
						class="flex size-10 shrink-0 items-center justify-center rounded-full {meta.className}"
					>
						<meta.icon class="size-5" />
					</div>
					<div class="flex min-w-0 flex-1 flex-col gap-2">
						<div class="flex flex-wrap items-center gap-2">
							<Badge variant="outline">{meta.label}</Badge>
							<span class="text-xs text-muted-foreground">
								{formatRelativeTime(notification.createdAt)}
							</span>
						</div>
						<h1 class="text-lg leading-tight font-semibold">{notification.title}</h1>
					</div>
				</div>
			</header>

			<div class="flex flex-col gap-4 p-5 sm:p-6">
				{#each notification.body as paragraph (paragraph)}
					<p class="text-sm leading-relaxed text-muted-foreground">{paragraph}</p>
				{/each}

				<Separator />

				<span class="text-xs text-muted-foreground">
					{formatFullTime(notification.createdAt)}
				</span>
			</div>
		</article>
	{:else}
		<PikslotEmpty
			icon={Bell}
			title="Notification not found"
			description="This notification may have been removed, or the link is no longer valid."
		/>
		<div class="flex justify-center">
			<Button variant="outline" class="gap-1.5" onclick={onBack}>
				<ArrowLeft class="size-4" />
				Back to notifications
			</Button>
		</div>
	{/if}
</div>
