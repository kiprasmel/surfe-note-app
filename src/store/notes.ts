import { useState, useEffect, useCallback } from "react";

import { fetchNotes } from "../service/note";

import { NOTE_ID, NoteData, getNewNote } from "./note";

export function useFetchNotes() {
	const [notesData, _setNotesData] = useState<NoteData[]>([getNewNote()]);

	const setNotesData = useCallback((data: NoteData[] | ((prev: NoteData[]) => NoteData[])) => {
		_setNotesData((prev) => {
			const data2 = data instanceof Function ? data(prev) : data;
			const data3: NoteData[] = hideRemovedNotes(data2);
			return data3;
		});
	}, []);

	const refetch = useCallback(
		() => fetchNotes().then((notes) => setNotesData([getNewNote(), ...notes])),
		[setNotesData]
	);

	useEffect(() => {
		refetch();
	}, [refetch]);

	return { notesData, setNotesData, refetch } as const;
}

/** if search changes, no note should be selected as active */
export function useActiveNote(search: string) {
	const [activeNote, setActiveNote] = useState<string>(NOTE_ID.INACTIVE);

	useEffect(() => {
		if (search) {
			setActiveNote(NOTE_ID.INACTIVE);
		}
	}, [search]);

	return [activeNote, setActiveNote] as const;
}

export function hideRemovedNotes(notesData: NoteData[]): NoteData[] {
	return notesData.filter((x) => !x.removed);
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
