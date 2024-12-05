import { useState, useReducer, useCallback } from "react";

// eslint-disable-next-line import/no-cycle
import { createUpdateNote } from "../service/note";
import { debounceAsync } from "../util/debounce";
import { assertNever } from "../util/assertNever";
import { clamp } from "../util/clamp";
import { getContentInsideRange, Range } from "../lib/markdown/range";
import { UserDB } from "../service/user";
import { getCursor } from "../util/cursor";

import { userFullName } from "./user";
import { getMentionAtCursor, insertMissingBracketsToMention, useMentionStore } from "./mention";

export type NoteData = {
	id: number;
	title: string;
	paragraphs: string[];
};

export function useNoteStore(initialData: NoteData, activeParagraphRef: React.RefObject<HTMLInputElement>) {
	const [id, setID] = useState(initialData.id);
	const [title, setTitle] = useState(initialData.title || "");

	const {
		wantsToTagUser, //
		stopWantingToTagUser,
		startOrContinueWantingToTagUser,
	} = useMentionStore();

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
		stopWantingToTagUser();
		dispatchParagraphs({ action: "focus", index });
	}

	async function editParagraph(e: React.ChangeEvent<HTMLInputElement>) {
		const { newValue, cursor, mention } = resolveNewParagraphValue(e.target, getCurrentParagraph());

		if (mention) {
			/**
			 * lowercase, because data from API is lowercase too;
			 * we only capitalize via css.
			 */
			const search = getContentInsideRange(newValue, mention).toLowerCase();

			startOrContinueWantingToTagUser(search);
		} else {
			stopWantingToTagUser();
		}

		await editParagraphState(newValue, cursor);
	}

	async function editParagraphState(newValue: string, newCursorPos: number | -1) {
		const action: ParagraphsAction = { action: "edit_paragraph", newValue };
		dispatchParagraphs(action);

		if (newCursorPos !== -1) {
			setTimeout(() => {
				activeParagraphRef.current?.setSelectionRange(newCursorPos, newCursorPos);
			}, 1);
		}

		// https://react.dev/reference/react/useReducer#ive-dispatched-an-action-but-logging-gives-me-the-old-state-value
		const newParagraphs = paragraphsReducer(paragraphs, action);
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
			stopWantingToTagUser();
			await newParagraphBelowFocusState();
		}
	}

	/**
	 * accept the selected mention from search:
	 * - insert into the paragraph
	 * - move cursor to new location (after inserted)
	 * - clear search
	 */
	async function acceptUserMentionSelection(acceptedUser: UserDB) {
		const acceptedFullName: string = userFullName(acceptedUser);

		const cursor: number = getCursor(activeParagraphRef.current!);
		const paragraph: string = getCurrentParagraph();

		const mention: Range = getMentionAtCursor(paragraph, cursor)!;

		const updatedParagraph: string = paragraph
			.slice(0, mention.beginInside) //
			.concat(acceptedFullName)
			.concat(paragraph.slice(mention.endInside));

		/** for updating cursor to new position */
		const updatedMention: Range = getMentionAtCursor(updatedParagraph, cursor)!;
		const updatedCursor: number = updatedMention.endOutside;

		stopWantingToTagUser();

		await editParagraphState(updatedParagraph, updatedCursor);
	}

	async function newParagraphBelowFocusState() {
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
		acceptUserMentionSelection,
		handleEventEnterPress,
		createUpdateNoteDebounced,
		wantsToTagUser,
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

export type GetNewParagraphWithCursorRet = {
	newValue: string;
	cursor: number;
	mention: Range | null;
};

function resolveNewParagraphValue(
	target: HTMLInputElement, //
	currentParagraph: string
): GetNewParagraphWithCursorRet {
	let cursor: number = getCursor(target);
	let newValue: string = target.value;

	({ newValue, cursor } = insertMissingBracketsToMention(newValue, currentParagraph, cursor));

	const mention: Range | null = getMentionAtCursor(newValue, cursor);

	return { newValue, cursor, mention };
}
