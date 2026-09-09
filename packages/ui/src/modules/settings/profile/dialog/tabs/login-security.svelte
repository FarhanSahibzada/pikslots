<script lang="ts">
	import FieldGroup from '$lib/components/ui/field/field-group.svelte';
	import Field from '$lib/components/ui/field/field.svelte';
	import FieldLabel from '$lib/components/ui/field/field-label.svelte';
	import { Separator } from '$lib/components/ui/separator/index.js';
</script>

<div class="flex flex-col">
	<h2 class="mb-1 text-sm font-semibold text-muted-foreground">Login & security</h2>
	<p class="pb-4 text-xs text-muted-foreground">
		Manage your login credentials and permission level.
	</p>
	<Separator class="mb-4" />
	<FieldGroup>
		<Field>
			<div class="flex items-center gap-2">
				<FieldLabel class="shrink-0">Email</FieldLabel>
				<span class="flex-1 text-center text-sm text-muted-foreground">user@example.com</span>
			</div>
		</Field>
		<Separator />
		<Field>
			<div class="flex items-center gap-2">
				<FieldLabel class="shrink-0">Permission level</FieldLabel>
				<span class="-ml-32 flex-1 text-center text-sm text-muted-foreground">Admin</span>
			</div>
		</Field>
	</FieldGroup>
</div>
