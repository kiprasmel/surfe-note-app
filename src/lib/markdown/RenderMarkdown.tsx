import { FC, useMemo } from "react";
import { css } from "emotion";

import { MarkdownKind, MarkdownStackItem, parseMarkdown } from "./parseMarkdown";
import { assertNever } from "../../util/assertNever";

export type RenderMarkdownProps = {
	content: string;
};

export const RenderMarkdown: FC<RenderMarkdownProps> = ({ content }) => {
	const renderedHTML: string = useMemo(() => renderMarkdownStackHTML(content), [content]);

	return (
		<div>
			<p
				className={styles.paragraphsContainer}
				dangerouslySetInnerHTML={{ __html: renderedHTML }} // eslint-disable-line react/no-danger
			/>
		</div>
	);
};

const styles = {
	paragraphsContainer: css`
		min-height: 1rem;
	`,
};

function renderMarkdownStackHTML(content: string, markdownStack: MarkdownStackItem[] = parseMarkdown(content)): string {
	const items: string[] = [];

	for (let i = 0; i < markdownStack.length; i++) {
		const [beginEnd, kind, idx]: MarkdownStackItem = markdownStack[i];

		if (kind === "raw") {
			const next = markdownStack[i + 1];

			console.assert(beginEnd === "begin");
			console.assert(next[0] === "end" && next[1] === "raw");

			const raw: string = content.slice(idx, next[2] + 1); // end is inclusive thus +1
			items.push(raw);

			i++; // adjust because `next` already handled

			continue;
		}

		switch (beginEnd) {
			case "begin": {
				items.push(`<span class="${markdownKind2StylesMap[kind]}">`);
				break;
			}
			case "end": {
				items.push(`</span>`);
				break;
			}
			default: {
				assertNever(beginEnd);
			}
		}
	}

	/**
	 * combine with empty string to avoid
	 * creating whitespace where it shouldn't be.
	 */
	return items.join("");
}

const markdownKind2StylesMap: Record<Exclude<MarkdownKind, "raw">, string> = {
	bold: css`
		font-weight: 600;
	`,
	italic: css`
		font-style: italic;
	`,
};
