<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import TrashIcon from '@lucide/svelte/icons/trash';
</script>

<div class="flex flex-col">
	<h2 class="mb-1 text-sm font-semibold text-muted-foreground">Manage your account</h2>
	<p class="pb-2 text-xs text-muted-foreground">Permanent actions that cannot be undone.</p>
	<Separator class="mb-4" />
	<div class="flex flex-col gap-3">
		<div>
			<h3 class="text-sm font-medium">Delete your account</h3>
			<p class="text-xs text-muted-foreground">
				All of your account data will be deleted permanently.
			</p>
		</div>
		<div>
			<Button variant="destructive" size="sm">
				<TrashIcon size={14} />
				Delete account
			</Button>
		</div>
	</div>
</div>
