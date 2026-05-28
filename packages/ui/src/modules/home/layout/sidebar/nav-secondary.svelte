<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import type { WithoutChildren } from '$lib/utils.js';
	import type { ComponentProps } from 'svelte';
	import type { Icon } from '@tabler/icons-svelte';
	import { page } from '$app/stores';

	let {
		items,
		...restProps
	}: {
		items: { title: string; url: string; icon: Icon; onclick?: () => void }[];
	} & WithoutChildren<ComponentProps<typeof Sidebar.Group>> = $props();

	function isActive(url: string): boolean {
		return $page.url.pathname === url || $page.url.pathname.startsWith(url + '/');
	}
</script>

<Sidebar.Group {...restProps}>
	<Sidebar.GroupContent>
		<Sidebar.Menu>
			{#each items as item (item.title)}
				<Sidebar.MenuItem>
					<Sidebar.MenuButton isActive={isActive(item.url)}
						>>
						{#snippet child({ props })}
							<div on:click={item.onclick}>
								<a href={item.url} {...props}>
									<item.icon />
									<span>{item.title}</span>
								</a>
							</div>
						{/snippet}
					</Sidebar.MenuButton>
				</Sidebar.MenuItem>
			{/each}
		</Sidebar.Menu>
	</Sidebar.GroupContent>
</Sidebar.Group>
