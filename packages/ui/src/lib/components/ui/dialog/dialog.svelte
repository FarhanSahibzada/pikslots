<script lang="ts">
	import { Dialog as DialogPrimitive } from 'bits-ui';

	let { open = $bindable(false), ...restProps }: DialogPrimitive.RootProps = $props();

	$effect(() => {
		if (open) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}
		return () => {
			document.body.style.overflow = '';
		};
	});
</script>

<DialogPrimitive.Root bind:open {...restProps} />
