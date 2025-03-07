"use client";
import GetVerifiedDialog from "@/app/components/get-verified-dialog";
import useFullHypercert from "@/app/contexts/full-hypercert";
import { verifiedAttestors } from "@/config/gainforest";
import { cn } from "@/lib/utils";
import { ArrowRight, ShieldAlert, ShieldCheck } from "lucide-react";
import React from "react";
import { useAccount } from "wagmi";

const VerificationIndicator = () => {
	const { address } = useAccount();
	const hypercert = useFullHypercert();
	const attesters = hypercert.attestations.map(
		(attestation) => attestation.attester,
	);

	const isVerified = attesters.some((attester) =>
		verifiedAttestors.has(attester),
	);
	const isCreator =
		hypercert.creatorAddress.toLowerCase() === address?.toLowerCase();

	return (
		<div
			className={cn(
				"w-full px-3 py-1 font-sans text-sm",
				isVerified
					? "bg-green-500/10 text-green-800 dark:text-green-300"
					: "bg-red-500/10 text-red-800 dark:text-red-300",
			)}
		>
			{isVerified ? (
				<div className="flex w-full items-center justify-center gap-1 text-center">
					<ShieldCheck size={16} className="opacity-50" />
					<span>This ecocert is verified.</span>
				</div>
			) : isCreator ? (
				<div className="flex w-full items-center justify-between">
					<span className="flex items-center gap-1">
						<ShieldAlert size={16} className="opacity-50" />
						<span>This ecocert is not verified.</span>
					</span>
					<GetVerifiedDialog
						hypercertId={hypercert.hypercertId}
						trigger={
							<button
								className="flex items-center justify-center gap-1 focus:underline hover:underline"
								type="button"
							>
								Apply Now <ArrowRight size={16} />
							</button>
						}
					/>
				</div>
			) : (
				<div className="flex w-full items-center justify-center gap-1 text-center">
					<ShieldAlert size={16} className="opacity-50" />
					<span>This ecocert is not verified.</span>
				</div>
			)}
		</div>
	);
};

export default VerificationIndicator;
