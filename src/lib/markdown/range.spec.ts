import assert from "assert";

import { MarkdownStackItem, parseMarkdown } from "./parseMarkdown";
import { getContentInsideRange, getRangesOfKind, findItemOfKind, Range } from "./range";

export function test_getRangesOfKind() {
	const content = "hello @[Mr. Robot]!";
	const cursor = 17; // right before `]`

	assert.deepStrictEqual(content[cursor], "]");

	const parsed: MarkdownStackItem[] = parseMarkdown(content);
	const parsedExpected: MarkdownStackItem[] = [
		["begin", "raw", 0],
		["end", "raw", 5],
		["begin", "mention", 6],
		["begin", "raw", 8],
		["end", "raw", 16],
		["end", "mention", 17],
		["begin", "raw", 18],
		["end", "raw", 18],
	];

	assert.deepStrictEqual(parsed, parsedExpected);

	const mentionsRanges: Range[] = getRangesOfKind("mention", parsed);
	const mentionsRangesExpected: Range[] = [
		{
			i: 2,
			j: 5,
			kind: "mention",
			beginOutside: 6,
			beginInside: 8,
			endInside: 17,
			endOutside: 18,
		},
	];

	assert.deepStrictEqual(mentionsRanges, mentionsRangesExpected);

	return {
		content,
		cursor,
		parsed,
		mentionsRanges,
	};
}

export function test_findItemOfKind() {
	const ret = test_getRangesOfKind();
	const { cursor, parsed } = ret;

	const mention = findItemOfKind("mention", cursor, parsed);
	const mentionExpected: Range = {
		i: 2,
		j: 5,
		kind: "mention",
		beginOutside: 6,
		beginInside: 8,
		endInside: 17,
		endOutside: 18,
	};

	assert.deepStrictEqual(mention, mentionExpected);

	return {
		...ret,
		mention,
	};
}

export function test_getContentInsideOfKind() {
	const { content, mention } = test_findItemOfKind();

	const rawContentInside: string = getContentInsideRange(content, mention);
	const rawContentInsideExpected = "Mr. Robot";

	assert.deepStrictEqual(rawContentInside, rawContentInsideExpected);

	return rawContentInside;
}
