import type { LoginJwtPayload } from '@pikslots/shared';
import { jwtDecode } from 'jwt-decode';

function createAuthStore() {
	let accessToken = $state<string | null>(null);
	let isInitializing = $state(true);

	function setAccessToken(token: string) {
		accessToken = token;
	}

	function clearAccessToken() {
		accessToken = null;
	}

	function setInitialized() {
		isInitializing = false;
	}

	function getPayloadData(): LoginJwtPayload | null {
		if (accessToken) return jwtDecode<LoginJwtPayload>(accessToken);
		return null;
	}

	return {
		get accessToken() {
			return accessToken;
		},
		get isAuthenticated() {
			return accessToken !== null;
		},
		get isInitializing() {
			return isInitializing;
		},
		setAccessToken,
		clearAccessToken,
		getPayloadData,
		setInitialized
	};
}

export const authStore = createAuthStore();
