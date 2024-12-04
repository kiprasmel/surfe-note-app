import { useState, useReducer, useCallback } from "react";

// eslint-disable-next-line import/no-cycle
import { createUpdateNote } from "../service/note";
import { debounceAsync } from "../util/debounce";
import { assertNever } from "../util/assertNever";
import { clamp } from "../util/clamp";

import { useFetchUsers } from "./user";

export type NoteData = {
	id: number;
	title: string;
	paragraphs: string[];
};

export function useNoteStore(initialData: NoteData) {
	const [id, setID] = useState(initialData.id);
	const [title, setTitle] = useState(initialData.title || "");

	const [wantsToTagUser, setWantsToTagUser] = useState<boolean>(false);
	const [taggableUsers] = useFetchUsers(); // TODO CONTEXT - currently performs a request for every single note..

	async function editTitle(newValue: string) {
		setTitle(newValue);
		await createUpdateNoteDebounced({ id, title: newValue, paragraphs: paragraphs.items });
	}

	const [paragraphs, dispatchParagraphs] = useReducer(
		paragraphsReducer, //
		null,
		() => getDefaultParagraphsState(initialData.paragraphs)
	);

	function getCurrentParagraph(): string {
		return paragraphs.items[paragraphs.focusItemIndex];
	}

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
		setWantsToTagUser(false);
		dispatchParagraphs({ action: "focus", index });
	}

	async function editParagraph(e: React.ChangeEvent<HTMLInputElement>) {
		let newValue: string = e.target.value;

		const selectionStart: number = e.target.selectionStart!;
		const selectionEnd: number = e.target.selectionEnd!;

		if (selectionStart !== selectionEnd) {
			const msg = `TODO implement selection >1 character`;
			throw new Error(msg);
		}

		const cursor: number = selectionStart;

		/**
		 * TODO: what if is editing middle of paragraph?
		 * should do delta from previous value (edit distance?) & see if added "@"
		 */
		const newLengthGreaterOrEqual: boolean = newValue.length >= getCurrentParagraph().length;
		const wantsToTag: boolean = newLengthGreaterOrEqual && newValue[cursor - 1] === "@";

		if (wantsToTag) {
			/**
			 * mark position of current "@" in the paragraph,
			 * so that can type in it regularly (will only go right i.e. won't modify index of "@"),
			 * so that we can use the paragraph text regularly,
			 * and it'll act as the search filter for the list of users too
			 * (we'll simply extract the "@[foo]" -> "foo" and use it for search).
			 */
			setWantsToTagUser(true);

			const hasBracketsAlready: boolean = newValue[cursor] === "[";

			if (!hasBracketsAlready) {
				/**
				 * current:
				 * `foo@`
				 *
				 * new:
				 * `foo@[]`
				 */
				newValue = newValue
					.slice(0, cursor) //
					.concat("[]")
					.concat(newValue.slice(cursor));

				setTimeout(() => {
					/**
					 * current:
					 * `foo @|` (cursor at |)
					 *
					 * new:
					 * `foo @[]|` (cursor at |)
					 *
					 * thus, move cursor inside `[]`:
					 * `foo @[|]`
					 */
					e.target.setSelectionRange(cursor + 1, cursor + 1);
				}, 1);
			}
		} else {
			setWantsToTagUser(false);
		}

		const action: ParagraphsAction = { action: "edit_paragraph", newValue };
		dispatchParagraphs(action);

		// https://react.dev/reference/react/useReducer#ive-dispatched-an-action-but-logging-gives-me-the-old-state-value
		const newParagraphs = paragraphsReducer(paragraphs, action);
		await createUpdateNoteDebounced({ id, title, paragraphs: newParagraphs.items });
	}

	async function newParagraphBelowFocus() {
		setWantsToTagUser(false);

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
		getCurrentParagraph,
		focusParagraph,
		editParagraph,
		newParagraphBelowFocus,
		createUpdateNoteDebounced,
		wantsToTagUser,
		taggableUsers,
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
