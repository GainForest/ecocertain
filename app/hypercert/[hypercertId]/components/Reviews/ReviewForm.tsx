import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useAccount } from "wagmi";

const ReviewForm = () => {
	const { isConnected } = useAccount();
	const [newReview, setNewReview] = useState("");

	const handleSubmitReview = () => {
		// This would be implemented with attestations
		console.log("Submitting review:", newReview);
		setNewReview("");
	};

	if (!isConnected) {
		return (
			<div className="flex h-full items-center justify-center">
				<Button
					variant="outline"
					className="w-3/4"
					onClick={() => {
						// This would trigger wallet connection
						console.log("Connect wallet");
					}}
				>
					Connect Wallet to Review
				</Button>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<h3 className="font-baskerville font-semibold text-xl">Write a Review</h3>
			<Textarea
				placeholder="Share your thoughts about this project..."
				value={newReview}
				onChange={(e) => setNewReview(e.target.value)}
				className="min-h-[200px]"
			/>
			<Button
				className="w-full"
				onClick={handleSubmitReview}
				disabled={!newReview.trim()}
			>
				Submit Review
			</Button>
		</div>
	);
};

export default ReviewForm;
