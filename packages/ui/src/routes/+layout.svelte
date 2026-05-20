<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { themeStore } from '$lib/stores/theme.svelte.js';
	import { authStore } from '$lib/stores/auth.svelte.js';
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
	import { Toaster } from 'svelte-sonner';
	import { refreshUserToken } from '../api/user/refresh.user.mutation';
	import { browser } from '$app/environment';

	let { children } = $props();

	const query = new QueryClient({
		defaultOptions: {
			queries: {
				enabled: browser
			}
		}
	});

	$effect(() => {
		themeStore.init();
		refreshUserToken()
			.then((res) => authStore.setAccessToken(res.accessToken))
			.catch(() => {})
			.finally(() => authStore.setInitialized());
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<Toaster position="top-center" title="Notification" theme={themeStore.current} />
<QueryClientProvider client={query}>{@render children()}</QueryClientProvider>
