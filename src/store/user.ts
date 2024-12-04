import { useState, useEffect } from "react";

import { UserDB, fetchUsers } from "../service/user";

export function useFetchUsers() {
	const [users, setUsers] = useState<UserDB[]>([]);

	useEffect(() => {
		fetchUsers().then(sortUsers).then(setUsers);
	}, []);

	return [users, setUsers] as const;
}

const sortUsers = (users: UserDB[]) => users.sort(compareUsers);

const compareUsers = (A: UserDB, B: UserDB) => {
	const fullA = userFullName(A);
	const fullB = userFullName(B);

	return fullA.localeCompare(fullB);
};

export const userFullName = (x: UserDB): string => x.first_name + " " + x.last_name;
