import { CLASS_ENDPOINTS } from '@pikslots/shared';
import type { BaseErrorResponse, UpdateClassInput, UpdateClassResponse } from '@pikslots/shared';
import { apiClient } from '$lib/http/axios.js';
import { mutationOptions } from '@tanstack/svelte-query';
import type { AxiosError } from 'axios';
import type { PikslotResponse } from '../common/common-models';

export const updateClass = async (input: UpdateClassInput): Promise<UpdateClassResponse> => {
	const url = CLASS_ENDPOINTS.UPDATE.replace(':classId', input.id);
	const { data } = await apiClient.patch<PikslotResponse<UpdateClassResponse>>(url, input);
	return data.data;
};

export const updateClassMutationOptions = () =>
	mutationOptions<UpdateClassResponse, AxiosError<BaseErrorResponse>, UpdateClassInput>({
		mutationKey: ['update-class'],
		mutationFn: updateClass
	});
