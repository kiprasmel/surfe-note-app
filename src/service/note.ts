import { ACCOUNT } from "../store/account";
import { NoteData } from "../ui/Note";
import { debounceAsync } from "../util/debounce";

export type NoteDBData = {
	id: number;
	body: string;
};

export const NOTE_ID = {
	NEW: -1,
	INACTIVE: -2,
} as const;

export const getEmptyNote = (): NoteData => ({ id: NOTE_ID.NEW, title: "", paragraphs: ["", "", ""] });

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
	const decoded: Pick<NoteData, "title" | "paragraphs"> = JSON.parse(noteDb.body);

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

export const createUpdateNoteDebounced = debounceAsync(createUpdateNote, 1000);
