<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/stores';
	import NotificationDetail from '../../../../modules/notifications/notification-detail.svelte';
</script>

<NotificationDetail
	notificationId={$page.params.notificationId ?? ''}
	onBack={() => goto(resolve('/home/notifications'))}
/>
