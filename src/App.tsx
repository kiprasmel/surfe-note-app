import { useState } from "react";
import { css } from "emotion";

import "./reset.css";

import { NoteData } from "./ui/Note";
import { NoteList } from "./ui/NoteList";

function App() {
	const [notesData, setNotesData] = useState<NoteData[]>([
		{ id: 1, paragraphs: [""], title: "" }, //
		{ id: 2, paragraphs: ["lorem ipsum", "dolor", "sit", "amet"], title: "" }, //
		{ id: 3, paragraphs: ["foo", "bar", "baz"], title: "fizzbuzz" }, //
		{ id: 4, paragraphs: ["1", "2", "3"], title: "123" }, //
	]);

	const [search, setSearch] = useState("");

	return (
		<div className={styles.app}>
			<nav className={styles.nav.nav}>
				<ul className={styles.nav.list}>
					<li>
						<input
							placeholder="Search in notes.."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
						/>
					</li>
					<li className={styles.nav.userItem}>User</li>
				</ul>
			</nav>

			<NoteList data={notesData} search={search} />
		</div>
	);
}

const styles = {
	app: css`
		margin: 0 0.5rem;
	`,
	nav: {
		nav: css`
			margin: 1rem 0 2rem 0;
		`,
		list: css`
			display: flex;
		`,
		userItem: css`
			margin-left: auto;
		`,
	},
};

export default App;
