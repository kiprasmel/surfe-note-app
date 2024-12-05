import { useState, useCallback } from "react";

// eslint-disable-next-line import/no-cycle
import { NOTE_ID, createUpdateNote } from "../service/note";
import { debounceAsync } from "../util/debounce";
import { getCursor } from "../util/cursor";

import { ParagraphsState, useParagraphsStore } from "./paragraphs";
import { NoteProps } from "../ui/Note";

export type NoteData = {
	id: number;
	title: string;
	paragraphs: string[];
};

export function useNoteStore(
	initialData: NoteData,
	setNotesData: NoteProps["setNotesData"],
	activeParagraphRef: React.RefObject<HTMLInputElement>
) {
	const [id, setID] = useState(initialData.id);
	const [title, setTitle] = useState(initialData.title || "");

	const {
		paragraphs,
		getCurrentParagraph, //
		focusParagraph,
		editParagraph,
		acceptUserMentionSelection,
		insertNewParagraphBelowFocus,
		deleteParagraph,
		wantsToTagUser,
	} = useParagraphsStore({
		initialData, //
		activeParagraphRef,
		updateNoteViaParagraphs,
	});

	/**
	 * not ideal:
	 * preferably we wouldn't derive our internal state from props (initial data),
	 * and instead would manipulate the global `notesData` state.
	 *
	 * but:
	 * 1. rewriting the whole `note` store to adjust to an array of notes,
	 *    instead of a single note, would be very tedious right now.
	 * 2. using the global notesData state for every update
	 *    (e.g. on every new character in paragraph) could be very slow.
	 *    at this point you'd utilize a state management library, e.g. redux,
	 *    but alas, the task does not permit this. thus, WONTFIX.
	 */
	async function syncNoteUpdateWithAPIAndParentState(note: NoteData) {
		setNotesData((xs) =>
			xs.map((x) =>
				x.id === note.id || (x.id === NOTE_ID.NEW && initialData.id === NOTE_ID.NEW) //
					? note
					: x
			)
		);

		await _createUpdateNoteDebounced(note);
	}

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const _createUpdateNoteDebounced = useCallback(
		debounceAsync(
			(data: NoteData) =>
				createUpdateNote(data).then((updated) => {
					if (data.id !== updated.id) {
						/** update to the server generated ID */
						setID(updated.id);
					}
				}),
			300
		),
		[]
	);

	async function updateTitle(newTitle: string) {
		setTitle(newTitle);
		await syncNoteUpdateWithAPIAndParentState({ id, title: newTitle, paragraphs: paragraphs.items });
	}

	async function updateNoteViaParagraphs(newParagraphs: ParagraphsState): Promise<void> {
		await syncNoteUpdateWithAPIAndParentState({ id, title, paragraphs: newParagraphs.items });
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

	async function handleEventBackspaceDeletePress(e: React.KeyboardEvent) {
		const isEmpty = !getCurrentParagraph();
		const isTheOnlyOne = paragraphs.items.length === 1;

		const shouldDelete = isEmpty && !isTheOnlyOne;

		if (shouldDelete) {
			e.preventDefault();
			deleteParagraph();
		}
	}

	function isAtBeginning(e: React.KeyboardEvent) {
		return getCursor(e.target as HTMLInputElement) === 0;
	}
	function isAtEnd(e: React.KeyboardEvent) {
		return getCursor(e.target as HTMLInputElement) === getCurrentParagraph().length;
	}

	function handleEventArrowLeftRightPress(e: React.KeyboardEvent) {
		if (isAtBeginning(e) && e.key === "ArrowLeft") {
			e.preventDefault();

			const newParagraphIdx = paragraphs.focusItemIndex - 1;

			if (newParagraphIdx >= 0) {
				const ending = paragraphs.items[newParagraphIdx].length;
				focusParagraph(newParagraphIdx, ending);
			}
		} else if (isAtEnd(e) && e.key === "ArrowRight") {
			e.preventDefault();

			const newParagraphIdx = paragraphs.focusItemIndex + 1;

			if (newParagraphIdx < paragraphs.items.length) {
				const beginning = 0;
				focusParagraph(newParagraphIdx, beginning);
			}
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
		handleEventBackspaceDeletePress,
		handleEventArrowLeftRightPress,
		wantsToTagUser,
	};
}
