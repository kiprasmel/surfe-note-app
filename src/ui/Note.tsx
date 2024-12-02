import { FC, useEffect, useReducer, useRef, useState } from "react";

import { assertNever } from "../util/assertNever";
import { clamp } from "../util/clamp";

export type NoteProps = {
	//
};

export const Note: FC<NoteProps> = ({}) => {
	const [title, setTitle] = useState("");

	const [paragraphs, dispatchParagraphs] = useReducer(paragraphsReducer, null, getDefaultParagraphsState);
	const activeParagraphRef = useRef<HTMLInputElement>(null);

	function handleKeyPress(e: React.KeyboardEvent): void {
		switch (e.key) {
			case "Enter": {
				dispatchParagraphs({ action: "new_paragraph_below_focus" });
				break;
			}
			case "ArrowUp": {
				dispatchParagraphs({ action: "focus", index: paragraphs.focusItemIndex - 1 });
				break;
			}
			case "ArrowDown": {
				dispatchParagraphs({ action: "focus", index: paragraphs.focusItemIndex + 1 });
				break;
			}
			default: {
				// noop
				return;
			}
		}

		e.preventDefault();
	}

	/**
	 * re-focus the currently active paragraph
	 * every time the focused item index changes.
	 *
	 * ideally we'd handle this in the event handler,
	 * but re-render only happens later,
	 * and since we store only the active element's ref (others are markdown renders),
	 * it's not really possible to do.
	 */
	useEffect(() => {
		activeParagraphRef.current?.focus();
	}, [paragraphs.focusItemIndex]);

	return (
		<div>
			<h2>
				<input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
			</h2>

			<div onKeyDown={handleKeyPress}>
				<ul>
					{paragraphs.items.map((paragraph, index) => (
						<li key={index} onClick={() => dispatchParagraphs({ action: "focus", index })}>
							{paragraphs.focusItemIndex === index ? (
								// editable
								<input
									ref={activeParagraphRef}
									value={paragraph.content}
									onChange={(e) => {
										dispatchParagraphs({ action: "edit_paragraph", newValue: e.target.value });
									}}
								/>
							) : (
								// view-only, rendered markdown
								paragraph.content
							)}
						</li>
					))}
				</ul>
			</div>
		</div>
	);
};

type ParagraphItem = {
	content: string;
	ref: React.MutableRefObject<null>;
};

type ParagraphsState = {
	focusItemIndex: number;
	items: ParagraphItem[];
};

function getDefaultParagraphsState(): ParagraphsState {
	return {
		focusItemIndex: 0,
		items: [getDefaultParagraphItem()],
	};
}

function getDefaultParagraphItem(): ParagraphItem {
	return {
		content: "",
		ref: { current: null },
	};
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
				items: state.items.map((x, i) =>
					i !== state.focusItemIndex
						? x
						: {
								...x,
								content: action.newValue,
							}
				),
			};
		}
		case "focus": {
			return {
				...state,
				focusItemIndex: clamp(action.index, 0, state.items.length - 1),
			};
		}
		default: {
			assertNever(action);
		}
	}
}
