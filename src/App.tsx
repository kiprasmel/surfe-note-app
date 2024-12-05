import { useState } from "react";
import { css } from "emotion";

import "./reset.css";

import { Contexts } from "./ui/Contexts";
import { NoteList } from "./ui/NoteList";
import { useFetchNotes } from "./store/notes";

function App() {
	const [search, setSearch] = useState("");
	const { notesData, setNotesData } = useFetchNotes();

	return (
		<Contexts>
			<div className={styles.app}>
				<nav className={styles.nav.nav}>
					<ul className={styles.nav.list}>
						<li className={styles.nav.listItem}>
							<input
								placeholder="Search in notes.."
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								className={styles.nav.search}
							/>
						</li>
					</ul>
				</nav>

				<NoteList notesData={notesData} setNotesData={setNotesData} search={search} />
			</div>
		</Contexts>
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
			padding: 0.1rem;

			border-radius: 4px;
			box-shadow:
				rgba(0, 0, 0, 0.12) 0px -12px 30px,
				rgba(0, 0, 0, 0.07) 0px 4px 6px,
				rgba(0, 0, 0, 0.17) 0px 10px 13px,
				rgba(0, 0, 0, 0.09) 0px -3px 5px;
		`,
		listItem: css`
			width: 100%;
		`,
		search: css`
			&,
			&:focus {
				font-size: 1.5rem;
				width: 100%;
				padding: 0.5rem;
			}
		`,
		userItem: css`
			margin-left: auto;
		`,
	},
};

export default App;
