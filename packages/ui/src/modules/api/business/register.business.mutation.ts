import { BUSINESS_ENDPOINTS } from '@pikslots/shared';
import { apiClient } from '$lib/http/axios.js';
import type { BusinessCreateInput, BusinessCreateResult } from './models/business-model';
import type { PikslotResponse } from '../common/common-models';

export const registerBusiness = async (
	input: BusinessCreateInput
): Promise<BusinessCreateResult> => {
	const { data } = await apiClient.post<PikslotResponse<BusinessCreateResult>>(
		BUSINESS_ENDPOINTS.REGISTER,
		input
	);
	return data.data;
};
