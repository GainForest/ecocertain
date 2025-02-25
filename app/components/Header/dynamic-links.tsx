"use client";

import QuickTooltip from "@/components/ui/quicktooltip";
import { CircleAlert, Sparkle } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import type { FC } from "react";
import { useAccount } from "wagmi";
import { DesktopNavLink, type NavLinkConfig, PhoneNavLink } from "./NavLinks";

export type ClientLink = {
	Desktop: FC;
	Mobile: FC;
};

const useMyHypercertsLink = (): {
	config: NavLinkConfig<"static">;
	isActive: boolean;
} => {
	const { address, isConnected } = useAccount();
	const pathname = usePathname();

	const hrefPath = `/profile/${address}`;
	const config = {
		type: "static" as const,
		id: "my-hypercerts",
		href: isConnected ? hrefPath : "#",
		text: "My Hypercerts",
		Icon: Sparkle,
	};

	const isActive = isConnected ? pathname === hrefPath : false;

	return { config, isActive };
};

export const MyHypercerts: ClientLink = {
	Desktop: () => {
		const data = useMyHypercertsLink();

		return (
			<QuickTooltip
				content={
					data.config.href === "#" ? (
						<div className="flex flex-col items-center gap-2">
							<div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/20">
								<CircleAlert className="text-destructive" size={22} />
							</div>
							<span className="text-center">
								Please connect your wallet
								<br /> to see your hypercerts.
							</span>
						</div>
					) : (
						<>View your hypercerts.</>
					)
				}
			>
				<DesktopNavLink link={data.config} isActive={data.isActive} />
			</QuickTooltip>
		);
	},
	Mobile: () => {
		const data = useMyHypercertsLink();
		return (
			<div className="flex items-center justify-between gap-2">
				<div className="flex flex-1 flex-col justify-center">
					<PhoneNavLink link={data.config} isActive={data.isActive} />
				</div>
				{data.config.href === "#" && (
					<QuickTooltip content="Please connect your wallet." openOnClick>
						<span className="flex h-6 w-6 items-center justify-center rounded-full bg-destructive/20">
							<CircleAlert className="text-destructive" size={16} />
						</span>
					</QuickTooltip>
				)}
			</div>
		);
	},
};
