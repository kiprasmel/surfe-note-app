import { useState } from "react";
import { css } from "emotion";

import "./reset.css";

import { Contexts } from "./ui/Contexts";
import { NoteList } from "./ui/NoteList";
import { useFetchNotes } from "./store/notes";
import { getNewNote } from "./store/note";
import { MEDIA_QUERY } from "./util/mediaQuery";

function App() {
	const [search, setSearch] = useState("");
	const { notesData, setNotesData } = useFetchNotes();

	function handleCreateNewNote() {
		setSearch("");
		setNotesData((xs) => [getNewNote(), ...xs]);
	}

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

				<div className={styles.newNote.container}>
					<button
						type="button"
						aria-label="New note"
						onClick={handleCreateNewNote}
						className={styles.newNote.button}
					>
						<div className={styles.newNote.plusLine1} />
						<div className={styles.newNote.plusLine2} />
					</button>
				</div>
			</div>
		</Contexts>
	);
}

const styles = {
	app: css`
		margin: 0 1rem 4rem 1rem;

		${MEDIA_QUERY.desktopUp} {
			margin: 1rem 4rem 8rem 4rem;
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
		}
	`,
	nav: {
		nav: css`
			margin: 2rem 0 2.5rem 0;

			${MEDIA_QUERY.desktopUp} {
				margin: 2rem 0 3rem 0;
			}
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
	newNote: {
		container: css`
			position: fixed;
			bottom: 1.5rem;
			right: 1.5rem;
			z-index: 10;
			user-select: none;
		`,
		button: css`
			position: relative;

			width: 4rem;
			height: 4rem;

			background: linear-gradient(45deg, hsl(0, 100%, 70%), hsl(240, 100%, 70%));
			border-radius: 100%;
			color: #fff;
			box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;

			font-weight: 800;
			font-size: 1rem;
			line-height: 1rem;

			display: flex;
			justify-content: center;
			align-items: center;
		`,
		plusLine1: css`
			width: 6px;
			height: 60%;
			background: #fff;
			position: absolute;
		`,
		plusLine2: css`
			width: 60%;
			height: 6px;
			background: #fff;
			position: absolute;
		`,
	},
};

export default App;
