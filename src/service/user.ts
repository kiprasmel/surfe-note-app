export type UserDB = {
	birthdate: number;
	email: string;
	first_name: string;
	gender: string;
	last_name: string;
	location: {
		city: string;
		postcode: number;
		state: string;
		street: string;
	};
	phone_number: string;
	title: string;
	username: string;
};

export async function fetchUsers(): Promise<UserDB[]> {
	const res = await fetch("https://challenge.surfe.com/users");
	const data: UserDB[] = await res.json();
	return data;
}
