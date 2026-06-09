<script>
	import NewService from '../../../../modules/services/new-service.svelte';
	import { goto } from '$app/navigation';
</script>

<NewService onBack={() => goto('/home/services')} />
