import { FC, useState } from "react";

export type NoteProps = {
	//
};

export const Note: FC<NoteProps> = ({}) => {
	const [title, setTitle] = useState("");

	return (
		<article>
			<h1>
				<input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
			</h1>
			<div>
				<input placeholder="Start typing.." />
			</div>
		</article>
	);
};
