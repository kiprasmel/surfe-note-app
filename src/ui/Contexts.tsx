import { FC, ReactNode } from "react";
import { UsersContextProvider } from "../store/user";

export type ContextsProps = {
	children: ReactNode;
};

export const Contexts: FC<ContextsProps> = ({ children }) => (
	<UsersContextProvider>
		{/*  */}
		{children}
	</UsersContextProvider>
);
