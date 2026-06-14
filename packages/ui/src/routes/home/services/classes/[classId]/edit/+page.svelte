<script lang="ts">
	import EditClass from '../../../../../../modules/services/edit-class.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
</script>

<EditClass classId={$page.params.classId} onBack={() => goto('/home/services')} />
