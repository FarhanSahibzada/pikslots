import { USER_ENDPOINTS } from '@pikslots/shared';
import { apiClient } from '$lib/http/axios.js';
import type { UserLoginInput, UserLoginResult } from './models/user-model';
import type { PikslotResponse } from '../common/common-models';

export const loginUser = async (input: UserLoginInput): Promise<UserLoginResult> => {
	const { data } = await apiClient.post<PikslotResponse<UserLoginResult>>(
		USER_ENDPOINTS.LOGIN,
		input
	);
	return data.data;
};
