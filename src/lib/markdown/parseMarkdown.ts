export type MarkdownBeginEnd = "begin" | "end";
export type MarkdownKind = "raw" | "bold" | "italic";
export type MarkdownStackItem = [MarkdownBeginEnd, MarkdownKind, index: number];

/**
 * returns a stack of items with begin/end indicators
 */
export function parseMarkdown(content: string): MarkdownStackItem[] {
	const stack: MarkdownStackItem[] = [];

	const marks: Record<MarkdownKind, boolean> = {
		raw: false,
		bold: false,
		italic: false,
	};

	for (let i = 0; i < content.length; i++) {
		const c: string = content[i];

		switch (c) {
			case "*": {
				endRaw(i);
				toggleMark("bold", i);
				break;
			}
			case "_": {
				endRaw(i);
				toggleMark("italic", i);
				break;
			}
			default: {
				if (!marks.raw) {
					marks.raw = true;
					stack.push(["begin", "raw", i]);
				}
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
