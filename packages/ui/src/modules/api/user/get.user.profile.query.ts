import { USER_ENDPOINTS } from '@pikslots/shared';
import { apiClient } from '$lib/http/axios.js';
import { queryOptions } from '@tanstack/svelte-query';
import type { UserProfileModel } from './models/user-model';
import type { PikslotResponse } from '../common/common-models';

export const getUserProfile = async (): Promise<UserProfileModel> => {
	const { data } = await apiClient.get<PikslotResponse<UserProfileModel>>(USER_ENDPOINTS.ME);
	return data.data;
};

export const getUserProfileQueryOptions = () =>
	queryOptions({
		queryKey: ['user', 'profile'],
		queryFn: getUserProfile
	});
