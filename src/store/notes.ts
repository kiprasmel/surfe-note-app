import { useState, useEffect } from "react";
import { getEmptyNote, fetchNotes, NOTE_ID } from "../service/note";
import { NoteData } from "./note";

export function useFetchNotes() {
	const [notesData, setNotesData] = useState<NoteData[]>([getEmptyNote()]);

	useEffect(() => {
		refetch();
	}, []);

	async function refetch() {
		return fetchNotes() //
			.then((notes) => setNotesData([getEmptyNote(), ...notes]));
	}

	return { notesData, setNotesData, refetch } as const;
}

/** if search changes, no note should be selected as active */
export function useActiveNote(search: string) {
	const [activeNote, setActiveNote] = useState<number>(NOTE_ID.INACTIVE);

	useEffect(() => {
		setActiveNote(NOTE_ID.INACTIVE);
	}, [search]);

	return [activeNote, setActiveNote] as const;
}

export function searchNotes(notesData: NoteData[], search: string): NoteData[] {
	return !search
		? notesData
		: notesData.filter(
				(note) =>
					note.title.includes(search) || //
					note.paragraphs.some((p) => p.includes(search))
			);
}
