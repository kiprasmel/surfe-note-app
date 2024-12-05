import { test_parseMarkdown } from "../lib/markdown/parseMarkdown";
import { test_getContentInsideOfKind, test_getRangesOfKind, test_findItemOfKind } from "../lib/markdown/range.spec";

function runTests() {
	test_parseMarkdown();

	test_getRangesOfKind();
	test_findItemOfKind();
	test_getContentInsideOfKind();
}

if (!module.parent) {
	runTests();
}
