import { useState } from "react";
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
