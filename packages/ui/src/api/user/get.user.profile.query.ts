import type { GetUserProfileResponse, BaseResponse } from '@pikslots/shared';
import { USER_ENDPOINTS } from '@pikslots/shared';
import { apiClient } from '$lib/http/axios.js';
import { queryOptions } from '@tanstack/svelte-query';

export const getUserProfile = async (): Promise<GetUserProfileResponse> => {
	const { data } = await apiClient.get<BaseResponse<GetUserProfileResponse>>(USER_ENDPOINTS.ME);
	return data.data;
};

export const getUserProfileQueryOptions = () =>
	queryOptions({
		queryKey: ['user', 'profile'],
		queryFn: getUserProfile
	});
