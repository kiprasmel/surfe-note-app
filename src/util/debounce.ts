export function debounce<T extends (...args: any[]) => unknown>(
	cb: T,
	timeoutMS: number
): (...args: Parameters<T>) => void {
	let lastCalled = new Date().getTime();
	let timeout: any = 0;

	function debounced(...args: Parameters<T>): void {
		const now = new Date().getTime();
		const delta = now - lastCalled;

		lastCalled = now;

		if (delta > timeoutMS) {
			lastCalled = Infinity; // prevent immediate calling after a long break
			cb(...args);
			return;
		}

		if (timeout) clearTimeout(timeout);
		timeout = setTimeout(() => debounced(...args), timeoutMS);
	}

	return debounced;
}
