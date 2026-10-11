import { BOOKING_ENDPOINTS } from '@pikslots/shared';
import type { BaseErrorResponse, DeleteBookingResponse } from '@pikslots/shared';
import { apiClient } from '$lib/http/axios.js';
import { mutationOptions } from '@tanstack/svelte-query';
import type { AxiosError } from 'axios';
import type { PikslotResponse } from '../common/common-models';

export const deleteBooking = async (bookingId: string): Promise<DeleteBookingResponse> => {
	const url = BOOKING_ENDPOINTS.DELETE.replace(':bookingId', bookingId);
	const { data } = await apiClient.delete<PikslotResponse<DeleteBookingResponse>>(url);
	return data.data;
};

export const deleteBookingMutationOptions = () =>
	mutationOptions<DeleteBookingResponse, AxiosError<BaseErrorResponse>, string>({
		mutationKey: ['delete-booking'],
		mutationFn: deleteBooking
	});
