import { PUBLIC_BOOKING_PAGE_ENDPOINTS } from '@pikslots/shared';
import type {
	BaseErrorResponse,
	RegisterPublicBookingRequest,
	RegisterPublicBookingResponse
} from '@pikslots/shared';
import { apiClient } from '$lib/http/axios.js';
import { mutationOptions } from '@tanstack/svelte-query';
import type { AxiosError } from 'axios';
import type { PikslotResponse } from '../common/common-models';

export const registerPublicBooking = async (
	input: RegisterPublicBookingRequest
): Promise<RegisterPublicBookingResponse> => {
	const { data } = await apiClient.post<PikslotResponse<RegisterPublicBookingResponse>>(
		PUBLIC_BOOKING_PAGE_ENDPOINTS.REGISTER,
		input
	);
	return data.data;
};

export const registerPublicBookingMutationOptions = () =>
	mutationOptions<
		RegisterPublicBookingResponse,
		AxiosError<BaseErrorResponse>,
		RegisterPublicBookingRequest
	>({
		mutationKey: ['register-public-booking'],
		mutationFn: registerPublicBooking
	});
