import { FC, useMemo } from "react";
import { css } from "emotion";

import { NoteData, getNewNote } from "../store/note";
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
				{searchedData.length ? (
					searchedData.map((x, i) => (
						<li key={x.clientId} onClick={() => setActiveNote(x.clientId)}>
							<Note
								initialData={x}
								setNotesData={setNotesData}
								active={activeNote === x.clientId}
								isOnlyOne={i === 0 && notesData.length === 1}
								nth={notesData.length - notesData.findIndex((y) => y.clientId === x.clientId)}
							/>
						</li>
					))
				) : (
					// empty note when search empty
					<div>
						<Note
							initialData={{
								...getNewNote(),
								title: "Uh oh..",
								paragraphs: ["Looks like *0* notes matched your search...", "Try adding _some more!_"],
							}}
							setNotesData={() => void 0}
							active={false}
							nth={0}
						/>
					</div>
				)}
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
