"use client";

import { useEffect, useRef } from "react";
import { useAccount, useChainId, useConnect } from "wagmi";

import { useTelemetry } from "@/contexts/telemetry";

const WalletTelemetryListener = () => {
	const { address, status, connector } = useAccount();
	const chainId = useChainId();
	const { error: connectError } = useConnect();
	const { logEvent } = useTelemetry();

	const previousStatus = useRef<typeof status>();
	const previousAddress = useRef<string | undefined>();
	const previousChainId = useRef<number | null>(null);
	const hasLoggedConnect = useRef(false);

	useEffect(() => {
		if (address) {
			previousAddress.current = address;
		}
	}, [address]);

	useEffect(() => {
		if (!address || status !== "connected") return;
		if (previousChainId.current === null) {
			previousChainId.current = chainId;
			return;
		}
		if (chainId && previousChainId.current !== chainId) {
			void logEvent({
				type: "wallet",
				event: "chain_switch",
				walletAddress: address,
				chainId,
			});
		}
		previousChainId.current = chainId;
	}, [address, chainId, status, logEvent]);

	useEffect(() => {
		if (status === previousStatus.current) return;

		if (status === "connected" && address && !hasLoggedConnect.current) {
			void logEvent({
				type: "wallet",
				event: "connect",
				walletAddress: address,
				connector: connector?.id ?? connector?.name,
				chainId,
			});
			hasLoggedConnect.current = true;
		}

		if (status === "disconnected" && previousStatus.current === "connected") {
			void logEvent({
				type: "wallet",
				event: "disconnect",
				walletAddress: previousAddress.current,
			});
			hasLoggedConnect.current = false;
		}

		previousStatus.current = status;
	}, [status, address, connector?.id, connector?.name, chainId, logEvent]);

	useEffect(() => {
		if (!connectError) return;
		void logEvent({
			type: "wallet",
			event: "error",
			message: connectError.message,
			context: {
				name: connectError.name,
			},
		});
	}, [connectError, logEvent]);

	return null;
};

export default WalletTelemetryListener;
