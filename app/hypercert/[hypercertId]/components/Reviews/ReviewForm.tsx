import useFullHypercert from "@/app/contexts/full-hypercert";
import { Button } from "@/components/ui/button";
import MarkdownEditor from "@/components/ui/mdx-editor";
import { Textarea } from "@/components/ui/textarea";
import { getEASConfig } from "@/config/eas";
import { useEthersSigner } from "@/hooks/use-ethers-signer";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { ArrowRight, CircleAlert, CircleCheck, Loader2 } from "lucide-react";
import { useState } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { useReviewSubmission } from "./contexts/ReviewSubmission";
const ReviewForm = () => {
	const { isConnected, chain } = useAccount();
	const { open } = useWeb3Modal();
	const { submitReview, state, dispatch } = useReviewSubmission();
	const { status, pendingReview } = state;
	const hypercert = useFullHypercert();
	const { hypercertId } = hypercert;
	const signer = useEthersSigner();

	if (!isConnected || !chain || !signer) {
		return (
			<div className="flex h-full items-center justify-center">
				<Button
					variant="outline"
					className="w-3/4"
					onClick={() => {
						open();
					}}
				>
					Connect Wallet to Review
				</Button>
			</div>
		);
	}

	const easConfig = getEASConfig(chain.id);
	if (!easConfig) {
		return (
			<div className="justify-cente flex h-full items-center gap-2">
				<p>Adding reviews is not supported on this chain.</p>
				<Button
					variant="outline"
					onClick={() => {
						open({ view: "Networks" });
					}}
				>
					Switch Network
				</Button>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<h3 className="font-baskerville font-semibold text-xl">Write a Review</h3>
			<MarkdownEditor
				placeholder="Share your thoughts about this project"
				markdown={pendingReview?.text || ""}
				onChange={(s) =>
					dispatch({ type: "UPDATE_PENDING_REVIEW", payload: s })
				}
				className="min-h-[200px] rounded-md border border-border"
				showToolbar={true}
				toolbarSize="sm"
				editorRef={null}
			/>
			<div className="flex items-center justify-between">
				{status.type !== "idle" && status.type !== "drafting" && (
					<div className="flex w-full flex-col items-center gap-2">
						{status.type.includes("ing") ? (
							<Loader2
								size={24}
								className="animate-spin text-muted-foreground"
							/>
						) : status.type === "error" ? (
							<CircleAlert size={24} className="text-red-500" />
						) : (
							<CircleCheck size={24} className="text-green-500" />
						)}
						<p className="font-sans">{status.label}</p>
						{status.type === "success" && (
							<Button
								variant="outline"
								onClick={() => {
									dispatch({ type: "CLEAR_PENDING_REVIEW" });
								}}
							>
								Add another review
							</Button>
						)}
						{status.type === "error" && (
							<Button
								variant="outline"
								onClick={() => dispatch({ type: "CLEAR_ERROR" })}
							>
								Try again
							</Button>
						)}
					</div>
				)}
				{(status.type === "idle" || status.type === "drafting") && (
					<div className="flex w-full items-center justify-end">
						<Button
							className="gap-2"
							onClick={() => submitReview(hypercertId, easConfig, signer)}
							disabled={(pendingReview?.text ?? "").length === 0}
						>
							Submit <ArrowRight size={16} />
						</Button>
					</div>
				)}
			</div>
		</div>
	);
};

export default ReviewForm;
