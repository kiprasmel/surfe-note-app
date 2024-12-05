import { useState } from "react";
import { css } from "emotion";

import "./reset.css";

import { Contexts } from "./ui/Contexts";
import { NoteList } from "./ui/NoteList";

function App() {
	const [search, setSearch] = useState("");

	return (
		<Contexts>
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

				<NoteList search={search} />
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
		`,
		userItem: css`
			margin-left: auto;
		`,
	},
};

export default App;
