import { USER_ENDPOINTS } from '@pikslots/shared';
import { apiClient } from '$lib/http/axios.js';
import { mutationOptions } from '@tanstack/svelte-query';
import type { AxiosError } from 'axios';
import type { UpdateWorkingHoursInput, UpdateWorkingHoursResult } from './models/user-model';
import type { PikslotErrorResponse, PikslotResponse } from '../common/common-models';

export const updateUserWorkingHours = async (
	input: UpdateWorkingHoursInput
): Promise<UpdateWorkingHoursResult> => {
	const { userId, ...body } = input;
	const url = USER_ENDPOINTS.UPDATE_WORKING_HOURS.replace(':userId', userId);
	const { data } = await apiClient.patch<PikslotResponse<UpdateWorkingHoursResult>>(url, body);
	return data.data;
};

export const updateUserWorkingHoursMutationOptions = () =>
	mutationOptions<
		UpdateWorkingHoursResult,
		AxiosError<PikslotErrorResponse>,
		UpdateWorkingHoursInput
	>({
		mutationKey: ['user', 'working-hours', 'update'],
		mutationFn: updateUserWorkingHours
	});
