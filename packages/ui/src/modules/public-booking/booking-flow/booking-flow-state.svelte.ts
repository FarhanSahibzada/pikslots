import type { PublicService, PublicSlot, PublicTeamMember } from '../types';

export type BookingStep =
	| 'service'
	| 'member-service'
	| 'team-member'
	| 'datetime'
	| 'contact'
	| 'confirmation';

export interface ContactDetails {
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	address: string;
	customFields: Record<string, string>;
}

/** `null` team member selection means "Any available". */
export function createBookingFlowState() {
	let step = $state<BookingStep>('service');
	let selectedService = $state<PublicService | null>(null);
	let selectedTeamMember = $state<PublicTeamMember | null>(null);
	let selectedDate = $state<string | null>(null); // 'YYYY-MM-DD'
	let selectedSlot = $state<PublicSlot | null>(null);
	let contact = $state<ContactDetails>({
		firstName: '',
		lastName: '',
		email: '',
		phone: '',
		address: '',
		customFields: {}
	});
	let bookingReference = $state<string | null>(null);
	const history: BookingStep[] = [];

	function reset() {
		step = 'service';
		selectedService = null;
		selectedTeamMember = null;
		selectedDate = null;
		selectedSlot = null;
		contact = {
			firstName: '',
			lastName: '',
			email: '',
			phone: '',
			address: '',
			customFields: {}
		};
		bookingReference = null;
		history.length = 0;
	}

	/**
	 * Enter the flow already knowing which service the customer wants.
	 * Always targets the team-member step first — `BookingFlow` auto-advances
	 * past it when the business/service config says to skip it.
	 */
	function startWithService(service: PublicService) {
		selectedService = service;
		step = 'team-member';
		history.length = 0;
	}

	/** Enter the flow already knowing which team member the customer wants. */
	function startWithTeamMember(member: PublicTeamMember) {
		reset();
		selectedTeamMember = member;
		step = 'service';
	}

	/** Enter the flow via the sidebar "Book" button — nothing preselected yet. */
	function startBlank() {
		reset();
	}

	/** Move to the next step, remembering the current one so Back can return to it. */
	function goTo(next: BookingStep) {
		if (next === step) return;
		history.push(step);
		step = next;
	}

	/** Jump to a step without recording history (auto-advancing past a skipped step). */
	function advance(next: BookingStep) {
		if (next !== step) step = next;
	}

	/** Return to the previously visited step. Returns false when already at the first step. */
	function back(): boolean {
		const prev = history.pop();
		if (prev === undefined) return false;
		step = prev;
		return true;
	}

	return {
		get step() {
			return step;
		},

		get selectedService() {
			return selectedService;
		},
		set selectedService(v: PublicService | null) {
			selectedService = v;
		},
		get selectedTeamMember() {
			return selectedTeamMember;
		},
		set selectedTeamMember(v: PublicTeamMember | null) {
			selectedTeamMember = v;
		},
		get selectedDate() {
			return selectedDate;
		},
		set selectedDate(v: string | null) {
			selectedDate = v;
		},
		get selectedSlot() {
			return selectedSlot;
		},
		set selectedSlot(v: PublicSlot | null) {
			selectedSlot = v;
		},
		get contact() {
			return contact;
		},
		get bookingReference() {
			return bookingReference;
		},
		set bookingReference(v: string | null) {
			bookingReference = v;
		},
		reset,
		startWithService,
		startWithTeamMember,
		startBlank,
		goTo,
		advance,
		back
	};
}

export type BookingFlowState = ReturnType<typeof createBookingFlowState>;
