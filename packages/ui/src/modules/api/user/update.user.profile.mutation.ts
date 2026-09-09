import { USER_ENDPOINTS } from '@pikslots/shared';
import { apiClient } from '$lib/http/axios.js';
import { mutationOptions } from '@tanstack/svelte-query';
import type { AxiosError } from 'axios';
import type { PikslotErrorResponse, PikslotResponse } from '../common/common-models';
import type { UpdateProfileInput, UpdateProfileResult } from './models/user-model';

export const updateUserProfile = async (input: UpdateProfileInput): Promise<UpdateProfileResult> => {
	const { data } = await apiClient.patch<PikslotResponse<UpdateProfileResult>>(
		USER_ENDPOINTS.UPDATE_PROFILE,
		input
	);
	return data.data;
};

export const updateUserProfileMutationOptions = () =>
	mutationOptions<UpdateProfileResult, AxiosError<PikslotErrorResponse>, UpdateProfileInput>({
		mutationKey: ['user', 'profile', 'update'],
		mutationFn: updateUserProfile
	});
