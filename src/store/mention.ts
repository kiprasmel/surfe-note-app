import { useState } from "react";

import { UserDB } from "../service/user";
import { Setter, getSetterValue } from "../util/setter";

import { useUsersContext, userFullName } from "./user";

export type WantsToTagUser = {
	wants: boolean;
	search: string;
	usersMatchingSearch: UserDB[];
	selectedUserIndex: number; // from within the current search
};

export function useMentionStore() {
	const taggableUsers = useUsersContext();

	const [wantsToTagUser, setWantsToTagUser] = useState<WantsToTagUser>({
		wants: false,
		search: "",
		usersMatchingSearch: [],
		selectedUserIndex: 0,
	});

	function stopWantingToTagUser() {
		setWantsToTagUser({ wants: false, search: "", usersMatchingSearch: taggableUsers, selectedUserIndex: 0 });
	}

	function startOrContinueWantingToTagUser(search: string) {
		const usersMatchingSearch: UserDB[] = !search
			? taggableUsers //
			: taggableUsers.filter(createFilterMentionSearch(search));

		setWantsToTagUser({ wants: true, search, usersMatchingSearch, selectedUserIndex: 0 });
	}

	function setSelectedUserIndex(_index: Setter<number>) {
		const index: number = getSetterValue(_index, wantsToTagUser.selectedUserIndex);

		if (index < 0 || index >= wantsToTagUser.usersMatchingSearch.length) {
			return;
		}

		setWantsToTagUser((x) => ({ ...x, selectedUserIndex: index }));
	}

	function getSelectedUser(): UserDB | null {
		return wantsToTagUser.usersMatchingSearch[wantsToTagUser.selectedUserIndex] || null;
	}

	return {
		wantsToTagUser,
		stopWantingToTagUser,
		startOrContinueWantingToTagUser,
		getSelectedUser,
		setSelectedUserIndex,
	};
}

export const createFilterMentionSearch =
	(search: string) =>
	(x: UserDB): boolean =>
		userFullName(x).includes(search) || x.username.includes(search);

export const TAGGABLE_USER_SEARCH_LIMIT = 5;

export function getTaggableUserLimit(wantsToTagUser: WantsToTagUser): number {
	return !wantsToTagUser.search ? wantsToTagUser.usersMatchingSearch.length : TAGGABLE_USER_SEARCH_LIMIT;
}

export function limitTaggableUsers(wantsToTagUser: WantsToTagUser): UserDB[] {
	const end = getTaggableUserLimit(wantsToTagUser);
	return wantsToTagUser.usersMatchingSearch.slice(0, end);
}
