import { BUSINESS_ENDPOINTS } from '@pikslots/shared';
import type { BaseErrorResponse } from '@pikslots/shared';
import { apiClient } from '$lib/http/axios.js';
import { mutationOptions } from '@tanstack/svelte-query';
import type { AxiosError } from 'axios';
import type {
	BusinessUpdateBookingCustomizationInput,
	BusinessUpdateBookingCustomizationResult
} from './models/business-model';
import type { PikslotResponse } from '../common/common-models';

export const updateBusinessBookingCustomization = async (
	input: BusinessUpdateBookingCustomizationInput
): Promise<BusinessUpdateBookingCustomizationResult> => {
	const { id, ...body } = input;
	const endpoint = BUSINESS_ENDPOINTS.UPDATE_BOOKING_CUSTOMIZATION.replace(':id', id);
	const { data } = await apiClient.patch<PikslotResponse<BusinessUpdateBookingCustomizationResult>>(
		endpoint,
		body
	);
	return data.data;
};

export const updateBusinessBookingCustomizationMutationOptions = () =>
	mutationOptions<
		BusinessUpdateBookingCustomizationResult,
		AxiosError<BaseErrorResponse>,
		BusinessUpdateBookingCustomizationInput
	>({
		mutationKey: ['update-business-booking-customization'],
		mutationFn: updateBusinessBookingCustomization
	});
