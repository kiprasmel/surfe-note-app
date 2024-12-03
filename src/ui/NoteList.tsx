import { FC, useEffect, useMemo, useState } from "react";

import { css } from "emotion";
import { Note, NoteData } from "./Note";

export type NoteListProps = {
	data: NoteData[];
	search?: string;
};

const INACTIVE_NOTE_ID = -1;

export const NoteList: FC<NoteListProps> = ({ data, search = "" }) => {
	const searchedData: NoteData[] = useMemo(() => searchNotes(data, search), [data, search]);
	const [activeNote, setActiveNote] = useState(INACTIVE_NOTE_ID);

	/** if search changes, no note should be selected as active */
	useEffect(() => {
		setActiveNote(INACTIVE_NOTE_ID);
	}, [search]);

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

function searchNotes(notesData: NoteData[], search: string): NoteData[] {
	return !search
		? notesData
		: notesData.filter(
				(note) =>
					note.title.includes(search) || //
					note.paragraphs.some((p) => p.includes(search))
			);
}
