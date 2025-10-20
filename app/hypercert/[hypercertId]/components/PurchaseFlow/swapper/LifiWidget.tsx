"use client";

import type { WidgetConfig } from "@lifi/widget";
import { LiFiWidget, WidgetSkeleton } from "@lifi/widget";
import { celo, mainnet } from "viem/chains";
import { ClientOnly } from "./ClientOnly";

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

	return (
		<div>
			<ClientOnly fallback={<WidgetSkeleton config={config} />}>
				<LiFiWidget config={config} integrator="gainforest" />
			</ClientOnly>
		</div>
	);
}
