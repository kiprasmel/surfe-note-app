import { useState, useCallback } from "react";

// eslint-disable-next-line import/no-cycle
import { createUpdateNote } from "../service/note";
import { debounceAsync } from "../util/debounce";

import { ParagraphsState, useParagraphsStore } from "./paragraphs";

export type NoteData = {
	id: number;
	title: string;
	paragraphs: string[];
};

export function useNoteStore(initialData: NoteData, activeParagraphRef: React.RefObject<HTMLInputElement>) {
	const [id, setID] = useState(initialData.id);
	const [title, setTitle] = useState(initialData.title || "");

	const {
		paragraphs,
		getCurrentParagraph, //
		focusParagraph,
		editParagraph,
		acceptUserMentionSelection,
		insertNewParagraphBelowFocus,
		wantsToTagUser,
	} = useParagraphsStore({
		initialData, //
		activeParagraphRef,
		updateNoteViaParagraphs,
	});

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const createUpdateNoteDebounced = useCallback(
		debounceAsync(
			(data: NoteData) =>
				createUpdateNote(data).then((updated) => {
					if (data.id !== updated.id) {
						/** update to the server generated ID */
						setID(updated.id);
					}
				}),
			1000
		),
		[]
	);

	async function updateTitle(newTitle: string) {
		setTitle(newTitle);
		await createUpdateNoteDebounced({ id, title: newTitle, paragraphs: paragraphs.items });
	}

	async function updateNoteViaParagraphs(newParagraphs: ParagraphsState): Promise<void> {
		await createUpdateNoteDebounced({ id, title, paragraphs: newParagraphs.items });
	}

	/**
	 * TODO extract "handleEvent" function from Note.tsx, since will need to intercept up/down arrow keys
	 * depending if currently wants to tag or not (if yes, should navigate selecting user from list)
	 */
	async function handleEventEnterPress() {
		if (wantsToTagUser.wants) {
			await acceptUserMentionSelection(wantsToTagUser.usersMatchingSearch[0]);
		} else {
			await insertNewParagraphBelowFocus();
		}
	}

	return {
		id,
		title,
		updateTitle,
		paragraphs,
		getCurrentParagraph,
		focusParagraph,
		editParagraph,
		acceptUserMentionSelection,
		handleEventEnterPress,
		wantsToTagUser,
	};
}
