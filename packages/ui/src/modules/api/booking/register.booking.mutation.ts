import { BOOKING_ENDPOINTS } from '@pikslots/shared';
import type {
	BaseErrorResponse,
	RegisterBookingRequest,
	RegisterBookingResponse
} from '@pikslots/shared';
import { apiClient } from '$lib/http/axios.js';
import { mutationOptions } from '@tanstack/svelte-query';
import type { AxiosError } from 'axios';
import type { PikslotResponse } from '../common/common-models';

export const registerBooking = async (
	input: RegisterBookingRequest
): Promise<RegisterBookingResponse> => {
	const { data } = await apiClient.post<PikslotResponse<RegisterBookingResponse>>(
		BOOKING_ENDPOINTS.REGISTER,
		input
	);
	return data.data;
};

export const registerBookingMutationOptions = () =>
	mutationOptions<RegisterBookingResponse, AxiosError<BaseErrorResponse>, RegisterBookingRequest>({
		mutationKey: ['register-booking'],
		mutationFn: registerBooking
	});
