/** 15 -> '15 mins', 60 -> '1 hr', 90 -> '1 hr 30 mins' */
export function formatDuration(durationInMins: number): string {
	const hours = Math.floor(durationInMins / 60);
	const minutes = durationInMins % 60;
	const parts: string[] = [];
	if (hours > 0) parts.push(`${hours} hr${hours > 1 ? 's' : ''}`);
	if (minutes > 0) parts.push(`${minutes} min${minutes !== 1 ? 's' : ''}`);
	return parts.length ? parts.join(' ') : '0 mins';
}

const CURRENCY_SYMBOLS: Record<string, string> = {
	PKR: 'Rs',
	USD: '$',
	RUB: '₽'
};

const SYMBOL_TO_CODE: Record<string, string> = {
	Rs: 'PKR',
	$: 'USD',
	'₽': 'RUB'
};

/** 0 -> 'Free', 25 -> '$25.00' */
export function formatCost(cost: number, currency: string): string {
	if (cost === 0) return 'Free';
	if (CURRENCY_SYMBOLS[currency]) {
		return `${CURRENCY_SYMBOLS[currency]} ${cost.toFixed(2)}`;
	}
	if (SYMBOL_TO_CODE[currency]) {
		return `${currency}${cost.toFixed(2)}`;
	}

	return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(cost);
}
