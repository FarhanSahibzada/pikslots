import { SERVICE_GROUP_ENDPOINTS } from '@pikslots/shared';
import type {
	BaseErrorResponse,
	RegisterServiceGroupInput,
	RegisterServiceGroupResponse
} from '@pikslots/shared';
import { apiClient } from '$lib/http/axios.js';
import { mutationOptions } from '@tanstack/svelte-query';
import type { AxiosError } from 'axios';
import type { PikslotResponse } from '../common/common-models';

export const registerServiceGroup = async (
	input: RegisterServiceGroupInput
): Promise<RegisterServiceGroupResponse> => {
	const { data } = await apiClient.post<PikslotResponse<RegisterServiceGroupResponse>>(
		SERVICE_GROUP_ENDPOINTS.REGISTER,
		input
	);
	return data.data;
};

export const registerServiceGroupMutationOptions = () =>
	mutationOptions<
		RegisterServiceGroupResponse,
		AxiosError<BaseErrorResponse>,
		RegisterServiceGroupInput
	>({
		mutationKey: ['register-service-group'],
		mutationFn: registerServiceGroup
	});
