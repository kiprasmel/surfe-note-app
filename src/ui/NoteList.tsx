import { FC, useEffect, useMemo, useState } from "react";
import { css } from "emotion";

import { NOTE_ID, fetchNotes, getEmptyNote } from "../service/note";

import { Note, NoteData } from "./Note";

export type NoteListProps = {
	search?: string;
};

export const NoteList: FC<NoteListProps> = ({ search = "" }) => {
	const [notesInitialData, _setNotesInitialData] = useFetchNotes();
	const searchedData: NoteData[] = useMemo(() => searchNotes(notesInitialData, search), [notesInitialData, search]);
	const [activeNote, setActiveNote] = useActiveNote(search);

	return (
		<div>
			<ul id="note-list" className={styles.noteList}>
				{searchedData.map((x) => (
					<li
						key={x.id}
						onClick={() => {
							setActiveNote(x.id);
						}}
					>
						<Note data={x} active={activeNote === x.id} />
					</li>
				))}
			</ul>
		</div>
	);
};

const styles = {
	noteList: css`
		display: flex;
		flex-direction: column;

		& > * + * {
			margin-top: 1rem;
		}
	`,
};

function useFetchNotes() {
	const [notesInitialData, setNotesInitialData] = useState<NoteData[]>([getEmptyNote()]);

	useEffect(() => {
		fetchNotes() //
			.then((notes) => setNotesInitialData([getEmptyNote(), ...notes]));
	}, []);

	return [notesInitialData, setNotesInitialData] as const;
}

/** if search changes, no note should be selected as active */
function useActiveNote(search: string) {
	const [activeNote, setActiveNote] = useState<number>(NOTE_ID.INACTIVE);

	useEffect(() => {
		setActiveNote(NOTE_ID.INACTIVE);
	}, [search]);

	return [activeNote, setActiveNote] as const;
}

function searchNotes(notesData: NoteData[], search: string): NoteData[] {
	return !search
		? notesData
		: notesData.filter(
				(note) =>
					note.title.includes(search) || //
					note.paragraphs.some((p) => p.includes(search))
			);
}
