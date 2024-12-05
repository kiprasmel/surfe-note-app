import { useState, useEffect, createContext, FC, ReactNode, useContext } from "react";

import { UserDB, fetchUsers } from "../service/user";

const UsersContext = createContext<UserDB[]>([]);

export const useUsersContext = () => useContext(UsersContext);

export const UsersContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
	const [users] = useFetchUsers();

	return <UsersContext.Provider value={users}>{children}</UsersContext.Provider>;
};

function useFetchUsers() {
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
