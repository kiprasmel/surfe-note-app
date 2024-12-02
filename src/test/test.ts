import { test_parseMarkdown } from "../lib/markdown/parseMarkdown";

function runTests() {
	test_parseMarkdown();
}

if (!module.parent) {
	runTests();
}
