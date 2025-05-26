"use client";

import AddAttestationDialog from "@/app/components/add-attestation-dialog";
import useFullHypercert from "@/app/contexts/full-hypercert";
import { Button } from "@/components/ui/button";
import EthAvatar from "@/components/ui/eth-avatar";
import QuickTooltip from "@/components/ui/quicktooltip";
import UserChip from "@/components/user-chip";
import { EAS_CONFIGS } from "@/config/eas";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import {
	ArrowUpRight,
	Copy,
	Eye,
	Globe,
	Link2,
	LinkIcon,
	PlusCircle,
} from "lucide-react";
import Link from "next/link";
import React from "react";
import SectionWrapper from "../SectionWrapper";
import Attestation from "./Attestation";
import URLSourcePreviewDialog from "./URLSourcePreviewDialog";

const Attestations = () => {
	const hypercert = useFullHypercert();
	const attestations = hypercert.attestations;
	const sortedAttestations = attestations.sort(
		(a, b) =>
			Number(b.creationBlockTimestamp) - Number(a.creationBlockTimestamp),
	);
	const validAttestations = sortedAttestations.filter((a) => {
		const attestationType = a.data.sources.at(0)?.type;
		if (attestationType === "url" || attestationType === undefined) {
			return true;
		}
		return false;
	});
	//   const validAttestations = attestations.filter((attestation) =>
	//     Boolean(EAS_CONFIGS.find((eas) => eas.schemaUID === attestation.schema_uid))
	//   );

	return (
		<SectionWrapper
			title="Proof of Impact"
			titleRight={
				<>
					{validAttestations.length > 2 && (
						<Link href={`/hypercert/${hypercert.hypercertId}/attestations`}>
							<Button variant={"outline"} size={"sm"} className="gap-2">
								View all
								<span className="rounded-full border border-border px-1 py-0.5 text-xs">
									{validAttestations.length}
								</span>
							</Button>
						</Link>
					)}
				</>
			}
		>
			<div className="flex flex-col items-center gap-4">
				<div className="flex w-full flex-col gap-2">
					{validAttestations.length === 0 ? (
						<div className="flex flex-col items-center justify-center gap-2 rounded-md bg-muted p-4 font-sans">
							<p className="text-muted-foreground text-sm">
								No proof of impact found
							</p>
						</div>
					) : (
						validAttestations.slice(0, 2).map((attestation) => {
							return (
								<Attestation
									key={attestation.uid}
									attestation={attestation}
									creatorAddress={hypercert.creatorAddress as `0x${string}`}
								/>
							);
						})
					)}
				</div>
				<div className={"flex w-full items-center justify-center"}>
					<AddAttestationDialog
						trigger={
							<Button variant="outline" className="gap-2" size={"sm"}>
								<PlusCircle size={16} />
								Add Proof of Impact
							</Button>
						}
						hypercertId={hypercert.hypercertId}
					/>
				</div>
			</div>
		</SectionWrapper>
	);
};

export default Attestations;
