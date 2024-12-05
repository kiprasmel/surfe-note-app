import { FC, useMemo } from "react";
import { css } from "emotion";

import { NoteData } from "../store/note";
import { searchNotes, useActiveNote } from "../store/notes";

import { Note, NoteProps } from "./Note";

export type NoteListProps = {
	notesData: NoteData[];
	setNotesData: NoteProps["setNotesData"];
	search?: string;
};

export const NoteList: FC<NoteListProps> = ({ notesData, setNotesData, search = "" }) => {
	const searchedData: NoteData[] = useMemo(() => searchNotes(notesData, search), [notesData, search]);
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
						<Note initialData={x} setNotesData={setNotesData} active={activeNote === x.id} />
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
