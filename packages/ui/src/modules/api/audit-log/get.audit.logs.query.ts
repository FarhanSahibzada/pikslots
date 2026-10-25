import { AUDIT_LOG_ENDPOINTS } from '@pikslots/shared';
import type { FindAllAuditLogsResponse } from '@pikslots/shared';
import { apiClient } from '$lib/http/axios.js';
import { queryOptions } from '@tanstack/svelte-query';
import type { PikslotResponse } from '../common/common-models';
import type { AuditLogFilter } from './models/audit-log-model';

export const getAuditLogs = async (filter: AuditLogFilter): Promise<FindAllAuditLogsResponse> => {
	const { data } = await apiClient.get<PikslotResponse<FindAllAuditLogsResponse>>(
		AUDIT_LOG_ENDPOINTS.FINDALL,
		{ params: filter }
	);
	return data.data;
};

export const getAuditLogsQueryOptions = (filter: AuditLogFilter) =>
	queryOptions({
		queryKey: ['audit-logs', filter],
		queryFn: () => getAuditLogs(filter),
		enabled: !!filter.businessId
	});
