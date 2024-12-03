import { useState } from "react";
import { css } from "emotion";

import "./reset.css";

import { NoteData } from "./ui/Note";
import { NoteList } from "./ui/NoteList";

function App() {
	const [notesData, setNotesData] = useState<NoteData[]>([
		{ id: 1, paragraphs: [""], title: "" }, //
		{ id: 2, paragraphs: [""], title: "" }, //
		{ id: 3, paragraphs: [""], title: "" }, //
		{ id: 4, paragraphs: [""], title: "" }, //
	]);

	return (
		<div className={styles.app}>
			<NoteList data={notesData} />
		</div>
	);
}

const styles = {
	app: css``,
};

export default App;
