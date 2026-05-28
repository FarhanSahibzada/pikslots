import { USER_ENDPOINTS } from '@pikslots/shared';
import { apiClient } from '$lib/http/axios.js';
import type { UserRefreshSessionResult } from './models/user-model';
import type { PikslotResponse } from '../common/common-models';

export const refreshUserToken = async (): Promise<UserRefreshSessionResult> => {
	const { data } = await apiClient.post<PikslotResponse<UserRefreshSessionResult>>(
		USER_ENDPOINTS.REFRESH
	);

	return data.data;
};
