<script lang="ts">
	import EditService from '../../../../../modules/services/edit-service.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
</script>

<EditService serviceId={$page.params.serviceId} onBack={() => goto('/home/services')} />
