import { FC, useEffect, useReducer, useRef, useState } from "react";

import { css } from "emotion";
import { assertNever } from "../util/assertNever";
import { clamp } from "../util/clamp";
import { RenderMarkdown } from "../lib/markdown/RenderMarkdown";

export type NoteData = {
	id: number;
	title: string;
	paragraphs: string[];
};

export type NoteProps = {
	data: NoteData;
	active: boolean;
};

export const Note: FC<NoteProps> = ({ data, active = false }) => {
	const [title, setTitle] = useState(data.title || "");

	const [paragraphs, dispatchParagraphs] = useReducer(
		paragraphsReducer, //
		null,
		() => getDefaultParagraphsState(data.paragraphs)
	);
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
		if (active) {
			activeParagraphRef.current?.focus();
		}
	}, [active, paragraphs.focusItemIndex]);

	return (
		<div className={styles.note}>
			<h2
				className={styles.title}
				onClick={() => dispatchParagraphs({ action: "focus", index: PARAGRAPH_FOCUS_TITLE })}
			>
				{active && paragraphs.focusItemIndex === PARAGRAPH_FOCUS_TITLE ? (
					<input
						ref={activeParagraphRef}
						placeholder="Title"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
					/>
				) : (
					<RenderMarkdown content={title} />
				)}
			</h2>

			<div onKeyDown={handleKeyPress}>
				<ul className={styles.paragraphList}>
					{paragraphs.items.map((paragraph, index) => (
						<li key={index} onClick={() => dispatchParagraphs({ action: "focus", index })}>
							{active && paragraphs.focusItemIndex === index ? (
								// editable, raw text
								<input
									ref={activeParagraphRef}
									value={paragraph.content}
									onChange={(e) => {
										dispatchParagraphs({ action: "edit_paragraph", newValue: e.target.value });
									}}
								/>
							) : (
								// view-only, rendered markdown
								<RenderMarkdown content={paragraph.content} />
							)}
						</li>
					))}
				</ul>
			</div>
		</div>
	);
};

const styles = {
	note: css`
		box-shadow: rgba(0, 0, 0, 0.15) 0px 2px 8px;
		line-height: 1.5rem;
		padding: 0.5rem;
	`,
	title: css`
		font-size: 1.5rem;
		line-height: 3rem;
	`,
	paragraphList: css`
		min-height: 4rem;
	`,
};

type ParagraphItem = {
	content: string;
};

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
	return {
		content,
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
				focusItemIndex: clamp(action.index, -1, state.items.length - 1),
			};
		}
		default: {
			assertNever(action);
		}
	}
}

const PARAGRAPH_FOCUS_TITLE = -1;
