import { BUSINESS_ENDPOINTS } from '@pikslots/shared';
import type { BaseErrorResponse } from '@pikslots/shared';
import { apiClient } from '$lib/http/axios.js';
import { mutationOptions } from '@tanstack/svelte-query';
import type { AxiosError } from 'axios';
import type {
	BusinessUpdateCustomerNotificationsInput,
	BusinessUpdateCustomerNotificationsResult
} from './models/business-model';
import type { PikslotResponse } from '../common/common-models';

export const updateBusinessCustomerNotifications = async (
	input: BusinessUpdateCustomerNotificationsInput
): Promise<BusinessUpdateCustomerNotificationsResult> => {
	const { id, ...body } = input;
	const endpoint = BUSINESS_ENDPOINTS.UPDATE_CUSTOMER_NOTIFICATIONS.replace(':id', id);
	const { data } = await apiClient.patch<
		PikslotResponse<BusinessUpdateCustomerNotificationsResult>
	>(endpoint, body);
	return data.data;
};

export const updateBusinessCustomerNotificationsMutationOptions = () =>
	mutationOptions<
		BusinessUpdateCustomerNotificationsResult,
		AxiosError<BaseErrorResponse>,
		BusinessUpdateCustomerNotificationsInput
	>({
		mutationKey: ['update-business-customer-notifications'],
		mutationFn: updateBusinessCustomerNotifications
	});
