"use client";

import { Button } from "@/components/ui/button";
import useAccount from "@/hooks/use-account";
import { useLogin, useLogout } from "@privy-io/react-auth";
import { useEffect } from "react";

const SignInButton = () => {
	const { authenticated } = useAccount();
	const { login } = useLogin();

	return (
		<Button disabled={authenticated} onClick={() => login()}>
			Connect Wallet
		</Button>
	);
};
SignInButton.displayName = "SignInButton";

export { SignInButton };
