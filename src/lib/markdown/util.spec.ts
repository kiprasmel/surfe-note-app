import assert from "assert";

import { insertContentIntoMention, insertMissingBracketsToMention } from "./util";

export function test_insertMissingBracketsToMention() {
	const paragraph = "foo ";
	const newParagraph = "foo @";
	const cursor = newParagraph.length;

	const inserted = insertMissingBracketsToMention(paragraph, newParagraph, cursor);

	const newParagraphWithInsertedExpected = newParagraph + "[]";
	const newCursorExpected: number = cursor + 1; // inside "[]"

	assert.deepStrictEqual(inserted.newParagraph, newParagraphWithInsertedExpected);
	assert.deepStrictEqual(inserted.newCursor, newCursorExpected);
}

export function test_insertContentIntoMention() {
	const paragraph = "foo @[bar] baz";
	const cursor = paragraph.indexOf("]"); // inside the very end of the mention

	assert.deepStrictEqual(paragraph[cursor], "]");

	const fullMention = "bar the great";
	const inserted = insertContentIntoMention(cursor, paragraph, fullMention);

	const paragraphExpected = `foo @[bar the great] baz`;
	const cursorExpected = paragraphExpected.indexOf("]") + 1; // right outside the ending of the mention

	assert.deepStrictEqual(inserted.updatedParagraph, paragraphExpected);
	assert.deepStrictEqual(inserted.updatedCursor, cursorExpected);
}
