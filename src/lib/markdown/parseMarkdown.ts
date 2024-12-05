export type MarkdownBeginEnd = "begin" | "end";
export type MarkdownKind = "raw" | "bold" | "italic" | "mention";
export type MarkdownStackItem = [MarkdownBeginEnd, MarkdownKind, index: number];

export const TokensBegin = {
	bold: "*",
	italic: "_",
	mention: "@[",

	/**
	 * special case:
	 * actually catches everything that did not match,
	 * but added here so that length matches.
	 */
	raw: "x",
} as const satisfies Record<MarkdownKind, string>;

export const TokensEnd = {
	bold: "",
	italic: "",
	mention: "]",
	raw: "",
} as const satisfies Record<MarkdownKind, string>;

/**
 * returns a stack of items with begin/end indicators
 */
export function parseMarkdown(content: string): MarkdownStackItem[] {
	const stack: MarkdownStackItem[] = [];

	const marks: Record<MarkdownKind, boolean> = {
		raw: false,
		bold: false,
		italic: false,
		mention: false,
	};

	for (let i = 0; i < content.length; i++) {
		const c: string = content[i];

		switch (c) {
			case TokensBegin.bold[0]: {
				endRaw(i);
				toggleMark("bold", i);
				break;
			}
			case TokensBegin.italic[0]: {
				endRaw(i);
				toggleMark("italic", i);
				break;
			}
			case TokensBegin.mention[0]: {
				if (content[i + 1] === TokensBegin.mention[1]) {
					endRaw(i);
					toggleMark("mention", i);
					i++;
				} else {
					handleDefault(i);
				}
				break;
			}
			case TokensEnd.mention[0]: {
				if (marks.mention) {
					endRaw(i);
					toggleMark("mention", i);
				} else {
					handleDefault(i);
				}
				break;
			}
			default: {
				handleDefault(i);
				break;
			}
		}
	}

	endRaw(content.length);

	function endRaw(i: number) {
		if (marks.raw) {
			marks.raw = false;
			stack.push(["end", "raw", i - 1]);
		}
	}

	function toggleMark(mark: MarkdownKind, i: number) {
		const beginEnd: MarkdownBeginEnd = marks[mark] ? "end" : "begin";
		stack.push([beginEnd, mark, i]);
		marks[mark] = !marks[mark];
	}

	function handleDefault(i: number) {
		if (!marks.raw) {
			marks.raw = true;
			stack.push(["begin", "raw", i]);
		}
	}

	return stack;
}

export function test_parseMarkdown() {
	const result: MarkdownStackItem[] = parseMarkdown("hello *world*!");

	const expected: MarkdownStackItem[] = [
		["begin", "raw", 0],
		["end", "raw", 5],
		["begin", "bold", 6],
		["begin", "raw", 7],
		["end", "raw", 11],
		["end", "bold", 12],
		["begin", "raw", 13],
		["end", "raw", 13],
	];

	console.assert(result === expected);
}
