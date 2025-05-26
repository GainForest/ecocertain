"use client";

import useFullHypercert from "@/app/contexts/full-hypercert";
import { Button } from "@/components/ui/button";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Pencil, Plus } from "lucide-react";
import { useState } from "react";
import SectionWrapper from "../SectionWrapper";
import ReviewCard from "./ReviewCard";
import ReviewsDialog from "./ReviewsDialog";
import { ReviewSubmissionProvider } from "./contexts/ReviewSubmission";
import type { Review } from "./types";

type DialogMode = "rw" | "r" | "w";

const Reviews = () => {
	const [allReviewsOpen, setAllReviewsOpen] = useState(false);
	const [dialogMode, setDialogMode] = useState<DialogMode>("rw");

	const openDialog = (mode: DialogMode) => {
		setDialogMode(mode);
		setAllReviewsOpen(true);
	};

	const hypercert = useFullHypercert();
	const attestations = hypercert.attestations;
	const reviewAttestations = attestations.filter(
		(a) => a.data.sources.at(0)?.type === "review",
	);

	console.log(attestations, reviewAttestations);

	const reviews = reviewAttestations.map((r) => {
		return {
			id: r.uid,
			text: r.data.description,
			authorAddress: r.attester as `0x${string}`,
			likes: 0,
			timestamp: Number(r.creationBlockTimestamp) * 1000,
			hasLiked: false,
		};
	});

	const sortedReviews = reviews.sort(
		(a, b) => Number(b.timestamp) - Number(a.timestamp),
	);

	return (
		<ReviewSubmissionProvider>
			<SectionWrapper
				title="Reviews"
				titleRight={
					<div className="flex gap-2">
						<Button
							variant={"outline"}
							size="sm"
							onClick={() => openDialog("w")}
						>
							<Pencil size={18} />
						</Button>
						<Button variant="link" size="sm" onClick={() => openDialog("rw")}>
							Show all
						</Button>
					</div>
				}
			>
				{sortedReviews.length > 0 ? (
					<ReviewCard review={sortedReviews[0]} />
				) : (
					<p className="rounded-xl bg-muted p-2 py-6 text-center text-muted-foreground">
						No reviews yet
					</p>
				)}

				<ReviewsDialog
					open={allReviewsOpen}
					onOpenChange={setAllReviewsOpen}
					initialMode={dialogMode}
					reviews={sortedReviews}
				/>
			</SectionWrapper>
		</ReviewSubmissionProvider>
	);
};

export default Reviews;
