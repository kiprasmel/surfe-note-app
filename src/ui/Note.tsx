import { FC, useEffect, useRef } from "react";
import { css, cx } from "emotion";

import { RenderMarkdown } from "../lib/markdown/RenderMarkdown";
import { NoteData, useNoteStore } from "../store/note";
import { userFullName } from "../store/user";
import { MEDIA_QUERY } from "../util/mediaQuery";

export type NoteProps = {
	initialData: NoteData;
	setNotesData: React.Dispatch<React.SetStateAction<NoteData[]>>;
	active: boolean;
	isOnlyOne?: boolean;
	nth: number;
};

export const Note: FC<NoteProps> = ({ initialData, setNotesData, active = false, isOnlyOne = false, nth }) => {
	const activeParagraphRef = useRef<HTMLInputElement>(null);
	const store = useNoteStore(initialData, setNotesData, activeParagraphRef);

	async function handleKeyPress(e: React.KeyboardEvent): Promise<void> {
		let prevent = true;

		switch (e.key) {
			case "Enter": {
				await store.handleEventEnterPress();
				break;
			}
			case "Backspace":
			case "Delete": {
				prevent = false;
				await store.handleEventBackspaceDeletePress(e);
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
			case "ArrowLeft":
			case "ArrowRight": {
				prevent = false;
				store.handleEventArrowLeftRightPress(e);
				break;
			}
			default: {
				prevent = false;
			}
		}

		if (prevent) e.preventDefault();
	}

	const shouldShowTitlePreview: boolean = isOnlyOne && !store.title;
	const shouldShowParagraphPreview: boolean = isOnlyOne && store.paragraphs.items.every((x) => !x);

	const titlePlaceholder = `Note #${nth}`;
	function getTitleContent() {
		return shouldShowTitlePreview ? "Your first note" : store.title || titlePlaceholder;
	}
	function getParagraphContent(paragraph: string, index: number) {
		return shouldShowParagraphPreview && index === 0
			? "*Click* me. *Start* typing. _Good things to come..._"
			: paragraph || "&nbsp;";
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
		<div
			className={cx(styles.note, {
				[styles.noteActive]: active,
			})}
		>
			<h2 className={styles.title} onClick={() => store.focusParagraph(PARAGRAPH_FOCUS_TITLE)}>
				{active && store.paragraphs.focusItemIndex === PARAGRAPH_FOCUS_TITLE ? (
					<input
						ref={activeParagraphRef}
						placeholder={titlePlaceholder}
						value={store.title}
						onChange={(e) => store.updateTitle(e.target.value)}
					/>
				) : (
					<RenderMarkdown content={getTitleContent()} />
				)}
			</h2>

			<div onKeyDown={handleKeyPress}>
				<ul className={styles.paragraphList}>
					{store.paragraphs.items.map((paragraph, index) => (
						<li key={index} onClick={() => store.focusParagraph(index)}>
							{active && store.paragraphs.focusItemIndex === index ? (
								// editable, raw text
								<div className={styles.activeParagraphContainer}>
									<input
										ref={activeParagraphRef}
										value={paragraph}
										onChange={(e) => store.editParagraph(e)}
									/>

									{!store.wantsToTagUser.wants ? null : (
										<div className={styles.userList.container}>
											<ul className={styles.userList.list}>
												{store.wantsToTagUser.usersMatchingSearch.map((x) => (
													<li
														key={x.username}
														onClick={() => store.acceptUserMentionSelection(x)}
														className={styles.userList.listItem}
													>
														<span className={styles.userList.name}>{userFullName(x)}</span>
													</li>
												))}
											</ul>
										</div>
									)}
								</div>
							) : (
								// view-only, rendered markdown
								<RenderMarkdown content={getParagraphContent(paragraph, index)} />
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

		${MEDIA_QUERY.desktopUp} {
			flex: 1;

			width: 20vw;
			min-height: 15vh;
			max-height: 30vh;
			padding: 1rem;

			overflow-y: scroll;
			scrollbar-width: none;
		}
	`,
	noteActive: css`
		${MEDIA_QUERY.desktopUp} {
			max-height: 60vh;
		}
	`,
	title: css`
		font-size: 1.5rem;
		line-height: 3rem;
	`,
	paragraphList: css`
		min-height: 4rem;
	`,
	activeParagraphContainer: css`
		position: relative;
	`,
	userList: {
		container: css`
			position: absolute;
			top: 100%;
			left: 50%;
			transform: translateX(-50%);

			background: #fff;
			box-shadow: rgba(0, 0, 0, 0.4) 0px 30px 90px;
			border-radius: 7px;
			z-index: 10;
		`,
		list: css`
			margin: 0.5rem 0;
		`,
		listItem: css`
			padding: 0.25rem 0.75rem;
		`,
		name: css`
			text-transform: capitalize;
		`,
	},
};

const PARAGRAPH_FOCUS_TITLE = -1;
