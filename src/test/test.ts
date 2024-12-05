import { test_parseMarkdown } from "../lib/markdown/parseMarkdown";
import { test_getContentInsideOfKind, test_getRangesOfKind, test_findItemOfKind } from "../lib/markdown/range.spec";
import { test_insertContentIntoMention, test_insertMissingBracketsToMention } from "../lib/markdown/util.spec";

export function runTests() {
	test_parseMarkdown();

	test_getRangesOfKind();
	test_findItemOfKind();
	test_getContentInsideOfKind();

	test_insertMissingBracketsToMention();
	test_insertContentIntoMention();
}

if (!module.parent) {
	runTests();
}
