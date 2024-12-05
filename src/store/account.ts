export const LS_SESSION_KEY = "note.kipras.org:session";

export const ACCOUNT = {
	session:
		localStorage.getItem(LS_SESSION_KEY) ||
		(localStorage.setItem(LS_SESSION_KEY, generateSessionID()), localStorage.getItem(LS_SESSION_KEY)!),
} satisfies { session: string };

function generateSessionID(): string {
	const time: number = new Date().getTime();
	const rand: number = Math.floor(Math.random() * 1e15);

	return `${time}:${rand}`;
}
