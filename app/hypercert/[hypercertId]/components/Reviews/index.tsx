"use client";

import { Button } from "@/components/ui/button";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Plus } from "lucide-react";
import { useState } from "react";
import SectionWrapper from "../SectionWrapper";
import AllReviewsDialog from "./AllReviewsDialog";
import ReviewCard from "./ReviewCard";
import type { Review } from "./types";

dayjs.extend(relativeTime);

// Dummy data
const dummyReviews: Review[] = [
	{
		id: "1",
		text: "This project has incredible potential for environmental impact. The team's approach to carbon reduction is innovative and well-thought-out.",
		authorAddress: "0x1234567890123456789012345678901234567890",
		likes: 5,
		timestamp: "2024-03-20T10:00:00Z",
		hasLiked: false,
	},
	{
		id: "2",
		text: "Great initiative! The transparency in reporting and measurement methods is commendable.",
		authorAddress: "0x9876543210987654321098765432109876543210",
		likes: 3,
		timestamp: "2024-03-19T15:30:00Z",
		hasLiked: true,
	},
	{
		id: "3",
		text: "Great initiative! The transparency in reporting and measurement methods is commendable.",
		authorAddress: "0x9876543210987654321098765432109876543210",
		likes: 3,
		timestamp: "2024-03-19T15:30:00Z",
		hasLiked: true,
	},
	{
		id: "4",
		text: "Great initiative! The transparency in reporting and measurement methods is commendable.",
		authorAddress: "0x9876543210987654321098765432109876543210",
		likes: 3,
		timestamp: "2024-03-19T15:30:00Z",
		hasLiked: true,
	},
	{
		id: "5",
		text: "Great initiative! The transparency in reporting and measurement methods is commendable.",
		authorAddress: "0x9876543210987654321098765432109876543210",
		likes: 3,
		timestamp: "2024-03-19T15:30:00Z",
		hasLiked: true,
	},
];

type DialogMode = "rw" | "r" | "w";

const Reviews = () => {
	const [allReviewsOpen, setAllReviewsOpen] = useState(false);
	const [dialogMode, setDialogMode] = useState<DialogMode>("rw");

	const openDialog = (mode: DialogMode) => {
		setDialogMode(mode);
		setAllReviewsOpen(true);
	};

	return (
		<SectionWrapper
			title="Reviews"
			titleRight={
				<div className="flex gap-2">
					<Button variant={"outline"} size="sm" onClick={() => openDialog("w")}>
						<Plus size={18} />
					</Button>
					<Button variant="link" size="sm" onClick={() => openDialog("rw")}>
						Show all
					</Button>
				</div>
			}
		>
			{dummyReviews.length > 0 ? (
				<ReviewCard review={dummyReviews[0]} />
			) : (
				<p className="text-center text-muted-foreground">No reviews yet</p>
			)}

			<AllReviewsDialog
				open={allReviewsOpen}
				onOpenChange={setAllReviewsOpen}
				initialMode={dialogMode}
				dummyReviews={dummyReviews}
			/>
		</SectionWrapper>
	);
};

export default Reviews;
