export function getCursor(target: HTMLInputElement): number {
	const selectionStart: number = target.selectionStart!;
	const selectionEnd: number = target.selectionEnd!;

	if (selectionStart !== selectionEnd) {
		const msg = `TODO implement selection with >1 character`;
		throw new Error(msg);
	}

	const cursor: number = selectionStart;
	return cursor;
}
