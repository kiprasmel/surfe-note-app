import { css } from "emotion";

import "./reset.css";

import { Note } from "./Note";

function App() {
	return (
		<div className={styles.app}>
			<Note />
		</div>
	);
}

const styles = {
	app: css``,
};

export default App;
