import { FC, useMemo, useState } from "react";

import { css } from "emotion";
import { Note, NoteData } from "./Note";

export type NoteListProps = {
	data: NoteData[];
	search?: string;
};

export const NoteList: FC<NoteListProps> = ({ data, search = "" }) => {
	const searchedData: NoteData[] = useMemo(() => searchNotes(data, search), [data, search]);
	const [activeNote, setActiveNote] = useState(-1);

	return (
		<div>
			<ul id="note-list" className={styles.noteList}>
				{searchedData.map((x, i) => (
					<li
						key={x.id}
						onClick={() => {
							setActiveNote(i);
						}}
					>
						<Note data={x} active={activeNote === i} />
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
