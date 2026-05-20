<script lang="ts">
	import PikslotEmpty from '$lib/components/pikslot-empty.svelte';
	import CalendarSad from '@tabler/icons-svelte/icons/calendar-sad';
</script>

<PikslotEmpty
	icon={CalendarSad}
	title="No bookings yet — let's change that!"
	description="Your calendar is wide open. Create your first booking to get started."
	buttonLabel="Create Booking"
/>
