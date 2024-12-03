import { FC, useState } from "react";

import { css } from "emotion";
import { Note, NoteData } from "./Note";

export type NoteListProps = {
	data: NoteData[];
};

export const NoteList: FC<NoteListProps> = ({ data }) => {
	const [activeNote, setActiveNote] = useState(0);

	return (
		<div>
			<ul id="note-list" className={styles.noteList}>
				{data.map((x, i) => (
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
	`,
};
