import { USER_ENDPOINTS } from '@pikslots/shared';
import { apiClient } from '$lib/http/axios.js';
import type { UserInviteInput, UserInviteResult } from './models/user-model';
import type { PikslotResponse } from '../common/common-models';

export const inviteUser = async (input: UserInviteInput): Promise<UserInviteResult> => {
	const { data } = await apiClient.post<PikslotResponse<UserInviteResult>>(
		USER_ENDPOINTS.INVITE,
		input
	);
	return data.data;
};
