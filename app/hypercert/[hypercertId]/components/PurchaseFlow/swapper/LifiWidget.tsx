"use client";

import { Button } from "@/components/ui/button";
import { useModal } from "@/components/ui/modal/context";
import {
	ModalContent,
	ModalDescription,
	ModalHeader,
	ModalTitle,
} from "@/components/ui/modal/modal";
import { useTelemetry } from "@/contexts/telemetry";
import type { Route, WidgetConfig } from "@lifi/widget";
import {
	LiFiWidget,
	WidgetEvent,
	WidgetSkeleton,
	useWidgetEvents,
} from "@lifi/widget";
import { ChevronLeft } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
	arbitrum,
	celo,
	filecoin,
	mainnet,
	optimism,
	polygon,
} from "viem/chains";
import { useSwitchChain } from "wagmi";
import { ClientOnly } from "./ClientOnly";

export interface WidgetProps {
	toToken: string;
	hypercertId: string;
}

const LifiWidgetConfig: Partial<WidgetConfig> = {
	appearance: "light",
	theme: {
		container: {
			boxShadow: "0px 8px 32px rgba(0, 0, 0, 0.08)",
			borderRadius: "16px",
			maxWidth: "340px",
			minWidth: "340px",
		},
		palette: {
			primary: {
				main: "#16a34a",
			},
			secondary: {
				main: "#f4f4f5",
			},
		},
		components: {
			MuiAppBar: {
				styleOverrides: {
					root: {
						"& p": {
							fontSize: "1rem",
							lineHeight: 1.2,
						},
					},
				},
			},
			MuiButton: {
				styleOverrides: {
					root: {
						textTransform: "none",
						"&:hover": {
							backgroundColor: "#16a34ae6",
						},
					},
				},
			},
		},
	},
	toChain: celo.id,
	chains: {
		allow: [
			arbitrum.id,
			mainnet.id,
			celo.id,
			polygon.id,
			optimism.id,
			filecoin.id,
		],
	},
	disabledUI: ["toAddress"],
};

export default function Widget({ toToken, hypercertId }: WidgetProps) {
	const widgetEvents = useWidgetEvents();
	const { switchChainAsync } = useSwitchChain();
	const config = { ...LifiWidgetConfig, toToken } as Partial<WidgetConfig>;
	const { popModal } = useModal();
	const { logEvent } = useTelemetry();
	const swapStartRef = useRef<number | null>(null);

	const switchAndPop = useCallback(async () => {
		await switchChainAsync(
			{ chainId: celo.id },
			{
				onSuccess: () => {
					popModal();
				},
			},
		);
	}, [switchChainAsync, popModal]);

	useEffect(() => {
		const parseUsd = (value?: string | number | null) => {
			if (value === undefined || value === null) return undefined;
			const numericValue = typeof value === "number" ? value : Number(value);
			return Number.isFinite(numericValue) ? numericValue : undefined;
		};

		const buildPayload = (route?: Route) => ({
			routeId: route?.id,
			fromChainId: route?.fromChainId,
			toChainId: route?.toChainId,
			fromToken: route?.fromToken?.address ?? route?.fromToken?.symbol,
			toToken: route?.toToken?.address ?? route?.toToken?.symbol,
			amountIn: parseUsd(route?.fromAmountUSD),
			amountOut: parseUsd(route?.toAmountUSD),
		});

		const onStarted = (route: Route) => {
			swapStartRef.current = performance.now();
			void logEvent({
				type: "lifi_swap",
				event: "route_started",
				hypercertId,
				...buildPayload(route),
			});
		};

		const onCompleted = async (route: Route) => {
			const durationMs = swapStartRef.current
				? Math.round(performance.now() - swapStartRef.current)
				: undefined;
			swapStartRef.current = null;
			toast.success("Swap completed successfully");
			void logEvent({
				type: "lifi_swap",
				event: "route_completed",
				hypercertId,
				durationMs,
				...buildPayload(route),
			});
			await switchAndPop();
		};

		const onFailed = (payload: { route: Route; process?: unknown }) => {
			const durationMs = swapStartRef.current
				? Math.round(performance.now() - swapStartRef.current)
				: undefined;
			swapStartRef.current = null;
			toast.error("Swap failed, please try again.");
			void logEvent({
				type: "lifi_swap",
				event: "route_failed",
				hypercertId,
				durationMs,
				errorLabel: undefined,
				...buildPayload(payload.route),
			});
		};

		widgetEvents.on(WidgetEvent.RouteExecutionStarted, onStarted);
		widgetEvents.on(WidgetEvent.RouteExecutionCompleted, onCompleted);
		widgetEvents.on(WidgetEvent.RouteExecutionFailed, onFailed);

		return () => widgetEvents.all.clear();
	}, [hypercertId, logEvent, switchAndPop, widgetEvents]);

	return (
		<ModalContent dismissible={false} className="font-sans">
			<ModalHeader className="flex items-center gap-4">
				<Button
					variant={"secondary"}
					size={"sm"}
					className="h-6 w-6 rounded-full p-0.5"
					onClick={switchAndPop}
				>
					<ChevronLeft />
				</Button>
				<div>
					<ModalTitle>Swap Tokens</ModalTitle>
					<ModalDescription>
						Swap your tokens into the ecocert currency.
					</ModalDescription>
				</div>
			</ModalHeader>
			<div className="mt-4">
				<ClientOnly fallback={<WidgetSkeleton config={config} />}>
					<LiFiWidget config={config} integrator="gainforest" />
				</ClientOnly>
			</div>
		</ModalContent>
	);
}
