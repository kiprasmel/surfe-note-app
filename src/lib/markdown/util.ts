/* eslint-disable no-param-reassign */

import { MarkdownStackItem, parseMarkdown } from "./parseMarkdown";
import { findItemOfKind, Range } from "./range";

export function insertMissingBracketsToMention(currentParagraph: string, newParagraph: string, newCursor: number) {
	const newLengthGreaterOrEqual: boolean = newParagraph.length >= currentParagraph.length;
	const wantsToTag: boolean = newLengthGreaterOrEqual && newParagraph[newCursor - 1] === "@";

	if (wantsToTag) {
		const hasBracketsAlready: boolean = newParagraph[newCursor] === "[";

		if (!hasBracketsAlready) {
			/**
			 * current:
			 * `foo@`
			 *
			 * new:
			 * `foo@[]`
			 */
			newParagraph = newParagraph
				.slice(0, newCursor) //
				.concat("[]")
				.concat(newParagraph.slice(newCursor));
		}

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
		newCursor++;
	}

	return { newParagraph, newCursor };
}

export function insertContentIntoMention(
	cursor: number,
	paragraph: string,
	mentionContent: string
): { updatedParagraph: string; updatedCursor: number } {
	const mention: Range = getMentionAtCursor(paragraph, cursor)!;

	const updatedParagraph: string = paragraph
		.slice(0, mention.beginInside) //
		.concat(mentionContent)
		.concat(paragraph.slice(mention.endInside));

	/** for updating cursor to new position */
	const updatedMention: Range = getMentionAtCursor(updatedParagraph, cursor)!;
	const updatedCursor: number = updatedMention.endOutside;

	return { updatedParagraph, updatedCursor };
}

export function getMentionAtCursor(paragraph: string, cursor: number): Range | null {
	const parsed: MarkdownStackItem[] = parseMarkdown(paragraph);

	const mention = findItemOfKind("mention", cursor, parsed);

	return mention;
}
