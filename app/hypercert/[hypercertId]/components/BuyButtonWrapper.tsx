"use client";
import { Button, type ButtonProps } from "@/components/ui/button";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import React from "react";
import { useAccount } from "wagmi";

const BuyButton = ({
	children,
	className,
	onClick,
	disabled,
	...props
}: ButtonProps) => {
	const { isConnected, isConnecting } = useAccount();
	const { open } = useWeb3Modal();
	return (
		<Button
			{...props}
			disabled={disabled || isConnecting}
			onClick={(evt) => {
				if (isConnecting) return;
				if (!isConnected) {
					open();
				}
				onClick?.(evt);
			}}
		>
			{children}
		</Button>
	);
};

export default BuyButton;
