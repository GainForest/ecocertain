"use client";

import { Button } from "@/components/ui/button";
import { useModal } from "@/components/ui/modal/context";
import {
	ModalContent,
	ModalDescription,
	ModalHeader,
	ModalTitle,
} from "@/components/ui/modal/modal";
import type { WidgetConfig } from "@lifi/widget";
import { LiFiWidget, WidgetSkeleton } from "@lifi/widget";
import { ChevronLeft } from "lucide-react";
import { celo, mainnet } from "viem/chains";
import { ClientOnly } from "./ClientOnly";

export interface WidgetProps {
	toChainId: number;
	toToken: string;
}

export function Widget() {
	const config = {
		appearance: "light",
		theme: {
			container: {
				boxShadow: "0px 8px 32px rgba(0, 0, 0, 0.08)",
				borderRadius: "16px",
				maxWidth: "340px",
				minWidth: "340px",
			},
		},
		toChain: celo.id,
		toToken: "0x471EcE3750Da237f93B8E339c536989b8978a438",
	} as Partial<WidgetConfig>;
	const { popModal } = useModal();

	return (
		<ModalContent dismissible={false} className="font-sans">
			<ModalHeader className="flex items-center gap-4">
				<Button
					variant={"secondary"}
					size={"sm"}
					className="h-6 w-6 rounded-full p-0.5"
					onClick={() => popModal()}
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
