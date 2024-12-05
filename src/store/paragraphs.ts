import { useReducer } from "react";

import { UserDB } from "../service/user";
import { getCursor } from "../util/cursor";
import { assertNever } from "../util/assertNever";
import { clamp } from "../util/clamp";
import { getContentInsideRange, Range } from "../lib/markdown/range";
import { getMentionAtCursor, insertContentIntoMention, insertMissingBracketsToMention } from "../lib/markdown/util";

import { useMentionStore } from "./mention";
import { userFullName } from "./user";
import { NoteData } from "./note";

export type UseParagraphsStoreCtx = {
	initialData: NoteData;
	activeParagraphRef: React.RefObject<HTMLInputElement>;
	updateNoteViaParagraphs: (newParagraphs: ParagraphsState) => Promise<void>;
};

export function useParagraphsStore({
	initialData, //
	activeParagraphRef,
	updateNoteViaParagraphs,
}: UseParagraphsStoreCtx) {
	const {
		wantsToTagUser, //
		stopWantingToTagUser,
		startOrContinueWantingToTagUser,
	} = useMentionStore();

	const [paragraphs, dispatchParagraphs] = useReducer(
		paragraphsReducer, //
		null,
		() => getDefaultParagraphsState(initialData.paragraphs)
	);

	function getCurrentParagraph(): string {
		return paragraphs.items[paragraphs.focusItemIndex];
	}

	function focusParagraph(index: number) {
		stopWantingToTagUser();
		dispatchParagraphs({ action: "focus", index });
	}

	async function editParagraph(e: React.ChangeEvent<HTMLInputElement>) {
		const { newParagraph, newCursor, mention } = resolveNewParagraphValue(e.target, getCurrentParagraph());

		if (mention) {
			/** lowercase, because data from API is lowercase too; we only capitalize via css. */
			const search = getContentInsideRange(newParagraph, mention).toLowerCase();
			startOrContinueWantingToTagUser(search);
		} else {
			stopWantingToTagUser();
		}

		await _editParagraphState(newParagraph, newCursor);
	}

	async function _editParagraphState(newParagraph: string, newCursor: number | -1) {
		const action: ParagraphsAction = { action: "edit_paragraph", newParagraph };
		dispatchParagraphs(action);

		if (newCursor !== -1) {
			setTimeout(() => {
				activeParagraphRef.current?.setSelectionRange(newCursor, newCursor);
			}, 1);
		}

		// https://react.dev/reference/react/useReducer#ive-dispatched-an-action-but-logging-gives-me-the-old-state-value
		const newParagraphs = paragraphsReducer(paragraphs, action);
		await updateNoteViaParagraphs(newParagraphs);
	}

	/**
	 * accept the selected mention from search:
	 * - insert into the paragraph
	 * - move cursor to new location (after inserted)
	 * - clear search
	 */
	async function acceptUserMentionSelection(acceptedUser: UserDB) {
		const acceptedFullName: string = userFullName(acceptedUser);

		const { updatedParagraph, updatedCursor } = insertContentIntoMention(
			getCursor(activeParagraphRef.current!),
			getCurrentParagraph(),
			acceptedFullName
		);

		stopWantingToTagUser();
		await _editParagraphState(updatedParagraph, updatedCursor);
	}

	async function insertNewParagraphBelowFocus() {
		stopWantingToTagUser();
		await _insertNewParagraphBelowFocusState();
	}

	async function _insertNewParagraphBelowFocusState() {
		const action: ParagraphsAction = { action: "new_paragraph_below_focus" };
		dispatchParagraphs(action);

		const newParagraphs = paragraphsReducer(paragraphs, action);
		await updateNoteViaParagraphs(newParagraphs);
	}

	return {
		paragraphs,
		getCurrentParagraph,
		focusParagraph,
		editParagraph,
		acceptUserMentionSelection,
		insertNewParagraphBelowFocus,
		wantsToTagUser,
		startOrContinueWantingToTagUser,
		stopWantingToTagUser,
	};
}

export type ParagraphItem = string;

export type ParagraphsState = {
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
			newParagraph: string;
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
				items: state.items.map((x, i) => (i !== state.focusItemIndex ? x : action.newParagraph)),
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

export type NewParagraphValue = {
	newParagraph: string;
	newCursor: number;
	mention: Range | null;
};

function resolveNewParagraphValue(
	target: HTMLInputElement, //
	currentParagraph: string
): NewParagraphValue {
	const { newParagraph, newCursor } = insertMissingBracketsToMention(
		currentParagraph, //
		target.value,
		getCursor(target)
	);

	const mention: Range | null = getMentionAtCursor(newParagraph, newCursor);

	return { newParagraph, newCursor, mention };
}
