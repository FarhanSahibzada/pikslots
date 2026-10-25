let open = $state(false);

export const searchStore = {
	get open() {
		return open;
	},
	set open(v: boolean) {
		open = v;
	},
	openSearch() {
		open = true;
	},
	close() {
		open = false;
	},
	toggle() {
		open = !open;
	}
};
