export function debounce<T extends (...args: any[]) => unknown>(
	cb: T,
	timeoutMS: number
): (...args: Parameters<T>) => void {
	// Infinity - to prevent immediate call
	// if debounced called a while after it has been created.
	let lastCalled = Infinity;
	let timeout: any = 0;

	function debounced(...args: Parameters<T>): void {
		const now = new Date().getTime();
		const delta = now - lastCalled;

		lastCalled = now;

		if (delta > timeoutMS) {
			lastCalled = Infinity;
			cb(...args);
			return;
		}

		if (timeout) clearTimeout(timeout);
		timeout = setTimeout(() => debounced(...args), timeoutMS);
	}

	return debounced;
}

export function debounceAsync<T extends (...args: any[]) => Promise<any>>(
	cb: T,
	timeoutMS: number
): (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>> {
	let lastCalled = Infinity;
	let timeout: any = 0;

	async function debounced(...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> {
		return new Promise<Awaited<ReturnType<T>>>((resolve) => {
			const now = new Date().getTime();
			const delta = now - lastCalled;

			lastCalled = now;

			if (delta > timeoutMS) {
				lastCalled = Infinity;
				resolve(cb(...args));
				return;
			}

			if (timeout) clearTimeout(timeout);
			timeout = setTimeout(() => resolve(debounced(...args)), timeoutMS);
		});
	}

	return debounced;
}
