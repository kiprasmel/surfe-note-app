import { MarkdownKind, MarkdownStackItem, TokensBegin, TokensEnd } from "./parseMarkdown";

/**
 * @example
 *
 * `@[foo bar]`
 *  1 2      34
 *
 * 1 -> beginOutside
 * 2 -> beginInside
 * 3 -> endInside
 * 4 -> endOutside
 *
 */
export type Range = {
	/** begin's index in the computed array of ranges of `kind` */
	i: number;
	/** end's index in the computed array of ranges of `kind` */
	j: number;

	kind: MarkdownKind;

	/**
	 * (inclusive) index where range, including its `TokensStart`, begin.
	 */
	beginOutside: number;

	/**
	 * (exclusive) index where range, including its `TokensEnd`, ends.
	 * i.e. where next range would begin.
	 */
	endOutside: number;

	/** (inclusive) index where content *inside of the range* starts */
	beginInside: number;

	/** (exclusive) index where content *inside of the range* ends */
	endInside: number;
};

export function getRangesOfKind(kind: MarkdownKind, parsed: MarkdownStackItem[]): Range[] {
	const ranges: Range[] = [];

	for (let i = 0; i < parsed.length; i++) {
		const begin = parsed[i];

		if (begin[0] === "begin" && begin[1] === kind) {
			for (let j = i + 1; j < parsed.length; j++) {
				const end = parsed[j];

				if (end[0] === "end" && end[1] === kind) {
					const tokenLenBegin: number = TokensBegin[kind].length;
					const tokenLenEnd: number = TokensEnd[kind].length;

					const beginOutside: number = begin[2];
					const endInside: number = end[2];

					/**
					 * adjust positions for the token length.
					 * since ranges start at the index of the token,
					 * this adjustment is needed, but only for the begin,
					 * because end is also at the start of the token - no need to adjust.
					 */
					const beginInside: number = begin[2] + tokenLenBegin;
					const endOutside: number = end[2] + tokenLenEnd;

					ranges.push({
						i, //
						j,
						kind,
						beginOutside,
						beginInside,
						endInside,
						endOutside,
					});

					i = j;
					break;
				}
			}
		}
	}
	return ranges;
}

export function findItemOfKind(
	kind: MarkdownKind,
	cursor: number, //
	parsed: MarkdownStackItem[],
	ranges: Range[] = getRangesOfKind(kind, parsed)
): Range | null {
	for (let i = 0; i < ranges.length; i++) {
		const range = ranges[i];

		if (cursor >= range.beginInside && cursor <= range.endInside) {
			return range;
		}
	}

	return null;
}

export function getContentInsideRange(content: string, range: Pick<Range, "beginInside" | "endInside">): string {
	return content.slice(range.beginInside, range.endInside);
}
