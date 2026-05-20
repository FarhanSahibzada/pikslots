<script lang="ts">
	import PikslotEmpty from '$lib/components/pikslot-empty.svelte';
	import UserHeart from '@tabler/icons-svelte/icons/user-heart';
</script>

<PikslotEmpty
	icon={UserHeart}
	title="No customers yet — they're on their way!"
	description="Once bookings start coming in, your customers will appear here."
	buttonLabel="Add Customer"
/>
