import { useState } from "react";
import { MarkdownStackItem, parseMarkdown } from "../lib/markdown/parseMarkdown";
import { Range, findItemOfKind } from "../lib/markdown/range";
import { UserDB } from "../service/user";

import { useUsersContext, userFullName } from "./user";

export function useMentionStore() {
	const taggableUsers = useUsersContext();

	const [wantsToTagUser, setWantsToTagUser] = useState<{
		wants: boolean;
		search: string;
		usersMatchingSearch: UserDB[];
	}>({
		wants: false,
		search: "",
		usersMatchingSearch: [],
	});

	function stopWantingToTagUser() {
		setWantsToTagUser({ wants: false, search: "", usersMatchingSearch: taggableUsers });
	}

	function startOrContinueWantingToTagUser(search: string) {
		const usersMatchingSearch: UserDB[] = !search
			? taggableUsers //
			: taggableUsers.filter(createFilterMentionSearch(search));

		setWantsToTagUser({ wants: true, search, usersMatchingSearch });
	}

	return {
		wantsToTagUser,
		stopWantingToTagUser,
		startOrContinueWantingToTagUser,
	};
}

export const createFilterMentionSearch =
	(search: string) =>
	(x: UserDB): boolean =>
		userFullName(x).includes(search) || x.username.includes(search);

export function insertMissingBracketsToMention(newValue: string, currentParagraph: string, cursor: number) {
	const newLengthGreaterOrEqual: boolean = newValue.length >= currentParagraph.length;
	const wantsToTag: boolean = newLengthGreaterOrEqual && newValue[cursor - 1] === "@";

	if (wantsToTag) {
		const hasBracketsAlready: boolean = newValue[cursor] === "[";

		if (!hasBracketsAlready) {
			/**
			 * current:
			 * `foo@`
			 *
			 * new:
			 * `foo@[]`
			 */
			newValue = newValue
				.slice(0, cursor) //
				.concat("[]")
				.concat(newValue.slice(cursor));
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
		cursor++;
	}

	return { newValue, cursor };
}

export function getMentionAtCursor(paragraph: string, cursor: number): Range | null {
	const parsed: MarkdownStackItem[] = parseMarkdown(paragraph);

	const mention = findItemOfKind("mention", cursor, parsed);

	return mention;
}
