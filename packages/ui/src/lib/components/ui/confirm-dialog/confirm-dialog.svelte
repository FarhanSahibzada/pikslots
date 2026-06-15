<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Button } from '$lib/components/ui/button/index.js';

	interface Props {
		open: boolean;
		title: string;
		description: string;
		confirmLabel?: string;
		cancelLabel?: string;
		loading?: boolean;
		onConfirm: () => void;
		onCancel?: () => void;
	}

	let {
		open = $bindable(),
		title,
		description,
		confirmLabel = 'Delete',
		cancelLabel = 'Cancel',
		loading = false,
		onConfirm,
		onCancel
	}: Props = $props();

	function handleCancel() {
		open = false;
		onCancel?.();
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content
		class="max-w-sm"
		showCloseButton={false}
		interactOutsideBehavior="ignore"
		escapeKeydownBehavior="ignore"
	>
		<Dialog.Header>
			<Dialog.Title class="text-sm font-semibold">{title}</Dialog.Title>
			<Dialog.Description class="text-xs text-muted-foreground">{description}</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer class="flex justify-end gap-2">
			<Button variant="outline" size="sm" onclick={handleCancel} disabled={loading}>
				{cancelLabel}
			</Button>
			<Button variant="destructive" size="sm" onclick={onConfirm} disabled={loading}>
				{loading ? 'Deleting...' : confirmLabel}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
