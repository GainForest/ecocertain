"use client";

import { Button } from "@/components/ui/button";
import { useModal } from "@/components/ui/modal/context";
import {
	ModalContent,
	ModalDescription,
	ModalHeader,
	ModalTitle,
} from "@/components/ui/modal/modal";
import type { Route, WidgetConfig } from "@lifi/widget";
import {
	LiFiWidget,
	WidgetEvent,
	WidgetSkeleton,
	useWidgetEvents,
} from "@lifi/widget";
import { ChevronLeft } from "lucide-react";
import { useCallback, useEffect } from "react";
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

export default function Widget({ toToken }: WidgetProps) {
	const widgetEvents = useWidgetEvents();
	const { switchChainAsync } = useSwitchChain();
	const config = { ...LifiWidgetConfig, toToken } as Partial<WidgetConfig>;
	const { popModal } = useModal();

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
		const onCompleted = async (route: Route) => {
			toast.success("Swap completed successfully");
			switchAndPop();
		};

		widgetEvents.on(WidgetEvent.RouteExecutionCompleted, onCompleted);
		return () => widgetEvents.all.clear();
	}, [switchAndPop, widgetEvents]);

	return (
		<div
			style={{
				paddingBottom: "env(safe-area-inset-bottom)",
			}}
		>
			{/* pb for the address bar safety. TODO use env safe area inset bottom and test */}
			<ModalContent dismissible={false} className="pb-10 font-sans lg:pb-0">
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
		</div>
	);
}
