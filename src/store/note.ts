import { useState, useReducer, useCallback } from "react";

// eslint-disable-next-line import/no-cycle
import { createUpdateNote } from "../service/note";
import { debounceAsync } from "../util/debounce";
import { assertNever } from "../util/assertNever";
import { clamp } from "../util/clamp";

export type NoteData = {
	id: number;
	title: string;
	paragraphs: string[];
};

export function useNoteStore(initialData: NoteData) {
	const [id, setID] = useState(initialData.id);
	const [title, setTitle] = useState(initialData.title || "");

	async function editTitle(newValue: string) {
		setTitle(newValue);
		await createUpdateNoteDebounced({ id, title: newValue, paragraphs: paragraphs.items });
	}

	const [paragraphs, dispatchParagraphs] = useReducer(
		paragraphsReducer, //
		null,
		() => getDefaultParagraphsState(initialData.paragraphs)
	);

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

	function focusParagraph(index: number) {
		dispatchParagraphs({ action: "focus", index });
	}

	async function editParagraph(newValue: string) {
		const action: ParagraphsAction = { action: "edit_paragraph", newValue };
		dispatchParagraphs(action);

		// https://react.dev/reference/react/useReducer#ive-dispatched-an-action-but-logging-gives-me-the-old-state-value
		const newParagraphs = paragraphsReducer(paragraphs, action);
		await createUpdateNoteDebounced({ id, title, paragraphs: newParagraphs.items });
	}

	async function newParagraphBelowFocus() {
		const action: ParagraphsAction = { action: "new_paragraph_below_focus" };
		dispatchParagraphs(action);

		const newParagraphs = paragraphsReducer(paragraphs, action);
		await createUpdateNoteDebounced({ id, title, paragraphs: newParagraphs.items });
	}

	return {
		id,
		title,
		editTitle,
		paragraphs,
		dispatchParagraphs,
		focusParagraph,
		editParagraph,
		newParagraphBelowFocus,
		createUpdateNoteDebounced,
	};
}

type ParagraphItem = string;

type ParagraphsState = {
	focusItemIndex: number;
	items: ParagraphItem[];
};

function getDefaultParagraphsState(paragraphs: NoteData["paragraphs"] = []): ParagraphsState {
	return {
		focusItemIndex: 0,
		items:
			paragraphs.length > 0
				? paragraphs.map(getDefaultParagraphItem) //
				: [getDefaultParagraphItem()],
	};
}

function getDefaultParagraphItem(content = ""): ParagraphItem {
	return content;
}

type ParagraphsAction =
	| {
			action: "new_paragraph_below_focus";
	  }
	| {
			action: "edit_paragraph";
			newValue: string;
	  }
	| {
			action: "focus";
			index: number;
	  };

function paragraphsReducer(state: ParagraphsState, action: ParagraphsAction): ParagraphsState {
	switch (action.action) {
		case "new_paragraph_below_focus": {
			const items = [...state.items];
			items.splice(state.focusItemIndex + 1, 0, getDefaultParagraphItem()); // insert a new item

			const focusItemIndex = state.focusItemIndex + 1; // focus at the new item

			return {
				...state,
				items,
				focusItemIndex,
			};
		}
		case "edit_paragraph": {
			/**
			 * could be slow for long paragraphs.
			 * we could have separate state just for editing the current paragraph,
			 * and re-sync it with the global `items` state at an interval,
			 * but that's additional complexity beyond our current scope.
			 */
			return {
				...state,
				items: state.items.map((x, i) => (i !== state.focusItemIndex ? x : action.newValue)),
			};
		}
		case "focus": {
			return {
				...state,
				focusItemIndex: clamp(action.index, -1, state.items.length - 1),
			};
		}
		default: {
			assertNever(action);
		}
	}
}
