import { USER_ENDPOINTS } from '@pikslots/shared';
import { apiClient } from '$lib/http/axios.js';
import type { UserLogoutResult } from './models/user-model';
import type { PikslotResponse } from '../common/common-models';

export const logoutUser = async (): Promise<UserLogoutResult> => {
	const { data } = await apiClient.post<PikslotResponse<UserLogoutResult>>(USER_ENDPOINTS.LOGOUT);
	return data.data;
};
