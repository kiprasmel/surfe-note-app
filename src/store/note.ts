import { useState, useCallback } from "react";

import { createUpdateNote } from "../service/note";
import { debounceAsync } from "../util/debounce";
import { getCursor } from "../util/cursor";
import { NoteProps } from "../ui/Note";
import { UserDB } from "../service/user";
import { clamp } from "../util/clamp";

import { ParagraphsState, useParagraphsStore } from "./paragraphs";

export type NoteData = {
	id: number;

	/**
	 * client id. we will generate & use this ID in the client,
	 * to avoid re-rendering, losing focus from new note & other issues.
	 */
	clientId: string;

	title: string;
	paragraphs: string[];

	removed: boolean;
};

export const getNewNote = (): NoteData => ({
	clientId: generateNewNoteId(),
	id: NOTE_ID.NEW,
	title: "",
	paragraphs: ["", "", ""],
	removed: false,
});

const generateNewNoteId = () => {
	const rand = () => {
		/** do not reduce length of the resulting number (if r < 0.1, then number will have fewer digits) */
		let r;
		do {
			r = Math.random();
		} while (r < 0.1);

		return Math.floor(r * 1e10);
	};

	const id = [new Date().getTime(), rand(), rand(), rand()].join(":");
	return id;
};

export const NOTE_ID = {
	NEW: -1, // server
	INACTIVE: "inactive", // client
} as const;

export function useNoteStore(
	initialData: NoteData,
	setNotesData: NoteProps["setNotesData"],
	activeParagraphRef: React.RefObject<HTMLInputElement>
) {
	const { clientId, id, removed } = initialData;

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
		stopWantingToTagUser,
		getSelectedUser,
		setSelectedUserIndex,
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
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const syncNoteUpdateWithAPIAndParentState = useCallback(
		debounceAsync(async (data: NoteData) => {
			const setWithNewData = (newData: NoteData) => {
				setNotesData((xs) =>
					xs.map((x) =>
						x.clientId === newData.clientId //
							? newData
							: x
					)
				);
			};

			const isInitial: boolean = data.id === NOTE_ID.NEW;

			if (!isInitial) {
				/** save early, don't wait for async call to finish */
				setWithNewData(data);
			}

			/** perform sync with DB */
			const updated: NoteData = await createUpdateNote(data);

			if (isInitial) {
				/**
				 * after initial creation,
				 * will have the proper `serverId` assigned.
				 */
				setWithNewData(updated);
			}
		}, 500),
		[]
	);

	async function updateTitle(newTitle: string) {
		setTitle(newTitle);
		await syncNoteUpdateWithAPIAndParentState({
			clientId,
			id,
			title: newTitle,
			paragraphs: paragraphs.items,
			removed,
		});
	}

	async function updateRemoved(newRemoved: boolean) {
		await syncNoteUpdateWithAPIAndParentState({
			clientId,
			id,
			title,
			paragraphs: paragraphs.items,
			removed: newRemoved,
		});
	}

	async function updateNoteViaParagraphs(newParagraphs: ParagraphsState): Promise<void> {
		await syncNoteUpdateWithAPIAndParentState({
			clientId,
			id,
			title,
			paragraphs: newParagraphs.items,
			removed,
		});
	}

	/**
	 * TODO extract "handleEvent" function from Note.tsx, since will need to intercept up/down arrow keys
	 * depending if currently wants to tag or not (if yes, should navigate selecting user from list)
	 */
	async function handleEventEnterPress(e: React.KeyboardEvent) {
		e.preventDefault();

		if (wantsToTagUser.wants) {
			const user: UserDB | null = getSelectedUser();

			if (!user) {
				stopWantingToTagUser();
				return;
			}

			await acceptUserMentionSelection(user);
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

	function handleEventArrowUpDownPress(e: React.KeyboardEvent, taggableUserLimit: number) {
		e.preventDefault();

		const delta = e.key === "ArrowUp" ? -1 : 1;

		if (wantsToTagUser.wants) {
			setSelectedUserIndex((x) => {
				const wanted = x + delta;
				return clamp(wanted, 0, taggableUserLimit - 1);
			});
		} else {
			focusParagraph(paragraphs.focusItemIndex + delta);
		}
	}

	return {
		title,
		updateTitle,
		updateRemoved,
		paragraphs,
		getCurrentParagraph,
		focusParagraph,
		editParagraph,
		acceptUserMentionSelection,
		handleEventEnterPress,
		handleEventBackspaceDeletePress,
		handleEventArrowLeftRightPress,
		handleEventArrowUpDownPress,
		wantsToTagUser,
	};
}
