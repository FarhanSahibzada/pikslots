<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { getBusinessSlugFromHost, isAppHost } from '$utils/tenant-host';
	import Login from '../modules/login/login.svelte';
	import PublicBookingPage from '../modules/public-booking/public-booking-page.svelte';

	const host = browser ? window.location.hostname : '';
	const businessSlug = $derived(getBusinessSlugFromHost(host));
	const appHost = $derived(isAppHost(host));

	$effect(() => {
		if (browser && appHost) {
			goto(resolve('/home'));
		}
	});
</script>

{#if businessSlug}
	<PublicBookingPage slug={businessSlug} />
{:else if browser && !appHost}
	<Login />
{/if}
