import { ACCOUNT } from "../store/account";
import { NOTE_ID, NoteData } from "../store/note";

export type NoteDBData = {
	/** server ID */
	id: number;
	body: string;
};

export async function fetchNotes(): Promise<NoteData[]> {
	const res = await fetch(`https://challenge.surfe.com/${ACCOUNT.session}/notes`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	});

	const data: NoteDBData[] = await res.json();

	const dataDecoded = decodeNotesDBData(data);

	return dataDecoded;
}

export function decodeNotesDBData(data: NoteDBData[]): NoteData[] {
	return data.map(decodeNote).reverse(); // reverse so that newest come earliest
}

export function decodeNote(noteDb: NoteDBData): NoteData {
	const decoded: Omit<NoteData, "id"> = JSON.parse(noteDb.body);

	return {
		...decoded,
		id: noteDb.id,
	};
}

export function encodeNote({ id, ...note }: NoteData): NoteDBData {
	const encoded: NoteDBData = { id, body: JSON.stringify(note) };
	return encoded;
}

export async function createUpdateNote(note: NoteData): Promise<NoteData> {
	let method: string;
	let url: string;
	if (note.id === NOTE_ID.NEW) {
		method = "POST";
		url = `https://challenge.surfe.com/${ACCOUNT.session}/notes`;
	} else {
		method = "PUT";
		url = `https://challenge.surfe.com/${ACCOUNT.session}/notes/${note.id}`;
	}

	const res = await fetch(url, {
		method,
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(encodeNote(note)),
	});

	const data: NoteDBData = await res.json();

	const decoded: NoteData = decodeNote(data);
	return decoded;
}
