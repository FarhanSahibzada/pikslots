import type { PublicBusiness, PublicService, PublicTeamMember } from '../types';

export interface TeamStepResolution {
	skip: boolean;
	defaultMember: PublicTeamMember | null;
}

/** Whether the wizard should skip asking the customer to pick a team member. */
export function resolveTeamStep(
	business: PublicBusiness,
	teamMembers: PublicTeamMember[],
	selectedService?: PublicService | null
): TeamStepResolution {
	const skip = business.bookingSetup.skipTeamSelection || teamMembers.length <= 1;
	const defaultMember = skip
		? selectedService
			? (teamMembers.find((member) => member.serviceIds?.includes(selectedService.id)) ??
				teamMembers[0] ??
				null)
			: (teamMembers[0] ?? null)
		: null;
	return { skip, defaultMember };
}
