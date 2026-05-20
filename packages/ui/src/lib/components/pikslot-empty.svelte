<script lang="ts">
	import * as Empty from '$lib/components/ui/empty/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import type { Icon } from '@tabler/icons-svelte';
	import Plus from '@tabler/icons-svelte/icons/plus';

	let {
		icon: IconComponent,
		title,
		description,
		buttonLabel,
		onclick
	}: {
		icon: Icon;
		title: string;
		description: string;
		buttonLabel?: string;
		onclick?: () => void;
	} = $props();
</script>

<div class="px-4 lg:px-6">
	<Empty.Root>
		<Empty.Header>
			<IconComponent size={48} />
			<Empty.Title>{title}</Empty.Title>
			<Empty.Description>{description}</Empty.Description>
		</Empty.Header>
		{#if buttonLabel}
			<Empty.Content>
				<div class="flex gap-2">
					<Button {onclick}><Plus />{buttonLabel}</Button>
				</div>
			</Empty.Content>
		{/if}
	</Empty.Root>
</div>
