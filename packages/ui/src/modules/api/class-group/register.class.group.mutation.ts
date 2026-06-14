import { CLASS_GROUP_ENDPOINTS } from '@pikslots/shared';
import type {
	BaseErrorResponse,
	RegisterClassGroupInput,
	RegisterClassGroupResponse
} from '@pikslots/shared';
import { apiClient } from '$lib/http/axios.js';
import { mutationOptions } from '@tanstack/svelte-query';
import type { AxiosError } from 'axios';
import type { PikslotResponse } from '../common/common-models';

export const registerClassGroup = async (
	input: RegisterClassGroupInput
): Promise<RegisterClassGroupResponse> => {
	const { data } = await apiClient.post<PikslotResponse<RegisterClassGroupResponse>>(
		CLASS_GROUP_ENDPOINTS.REGISTER,
		input
	);
	return data.data;
};

export const registerClassGroupMutationOptions = () =>
	mutationOptions<
		RegisterClassGroupResponse,
		AxiosError<BaseErrorResponse>,
		RegisterClassGroupInput
	>({
		mutationKey: ['register-class-group'],
		mutationFn: registerClassGroup
	});
