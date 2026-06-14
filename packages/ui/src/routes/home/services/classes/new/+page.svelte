<script>
	import NewClass from '../../../../../modules/services/new-class.svelte';
	import { goto } from '$app/navigation';
</script>

<NewClass onBack={() => goto('/home/services')} />
