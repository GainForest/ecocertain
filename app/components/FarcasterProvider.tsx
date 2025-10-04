"use client";

import { sdk } from "@farcaster/frame-sdk";
import type React from "react";
import { useEffect } from "react";

const FarcasterProvider = ({ children }: { children: React.ReactNode }) => {
	useEffect(() => {
		sdk.actions.ready();
	}, []);
	return <>{children}</>;
};

export default FarcasterProvider;
