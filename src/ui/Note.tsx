import { FC, useEffect, useRef } from "react";
import { css } from "emotion";

import { RenderMarkdown } from "../lib/markdown/RenderMarkdown";
import { NoteData, useNoteStore } from "../store/note";

export type NoteProps = {
	initialData: NoteData;
	active: boolean;
};

export const Note: FC<NoteProps> = ({ initialData, active = false }) => {
	const store = useNoteStore(initialData);
	const activeParagraphRef = useRef<HTMLInputElement>(null);

	function handleKeyPress(e: React.KeyboardEvent): void {
		switch (e.key) {
			case "Enter": {
				store.newParagraphBelowFocus();
				break;
			}
			case "ArrowUp": {
				store.focusParagraph(store.paragraphs.focusItemIndex - 1);
				break;
			}
			case "ArrowDown": {
				store.focusParagraph(store.paragraphs.focusItemIndex + 1);
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
	}, [active, store.paragraphs.focusItemIndex]);

	return (
		<div className={styles.note}>
			<h2 className={styles.title} onClick={() => store.focusParagraph(PARAGRAPH_FOCUS_TITLE)}>
				{active && store.paragraphs.focusItemIndex === PARAGRAPH_FOCUS_TITLE ? (
					<input
						ref={activeParagraphRef}
						placeholder="Title"
						value={store.title}
						onChange={(e) => store.editTitle(e.target.value)}
					/>
				) : (
					<RenderMarkdown content={store.title || "Title"} />
				)}
			</h2>

			<div onKeyDown={handleKeyPress}>
				<ul className={styles.paragraphList}>
					{store.paragraphs.items.map((paragraph, index) => (
						<li key={index} onClick={() => store.focusParagraph(index)}>
							{active && store.paragraphs.focusItemIndex === index ? (
								// editable, raw text
								<input
									ref={activeParagraphRef}
									value={paragraph}
									onChange={(e) => store.editParagraph(e.target.value)}
								/>
							) : (
								// view-only, rendered markdown
								<RenderMarkdown content={paragraph || "&nbsp;"} />
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

const PARAGRAPH_FOCUS_TITLE = -1;
