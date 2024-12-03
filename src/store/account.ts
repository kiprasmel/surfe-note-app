export const LS_SESSION_KEY = "note.kipras.org:session";

export const ACCOUNT = {
	session:
		localStorage.getItem(LS_SESSION_KEY) ||
		(localStorage.setItem(LS_SESSION_KEY, "1733247526774"), localStorage.getItem(LS_SESSION_KEY)!),
} satisfies { session: string };
