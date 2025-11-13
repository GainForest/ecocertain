import { Button } from "@/components/ui/button";
import { useModal } from "@/components/ui/modal/context";
import {
	ModalContent,
	ModalDescription,
	ModalFooter,
	ModalHeader,
	ModalTitle,
} from "@/components/ui/modal/modal";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { type FormEventHandler, useState } from "react";
import { insertFeedback } from "./actions";

const FeedbackForm = () => {
	const [rating, setRating] = useState(0);
	const [hoverRating, setHoverRating] = useState(0);
	const [feedback, setFeedback] = useState("");
	const { hide, clear } = useModal();

	const mutation = useMutation({
		mutationFn: insertFeedback,
		onError: (e) => {
			console.error("Error submitting feedback", e);
		},
	});

	const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
		e.preventDefault();
		if (rating > 0) {
			await mutation.mutateAsync({ rating, feedback });
		}
	};
	const clearModal = () => {
		hide();
		clear();
	};

	if (mutation.isSuccess) {
		return (
			<ModalContent className="text-center">
				<ModalHeader>
					<div className="mb-4 text-4xl">🎉</div>
					<ModalTitle className="mb-2 font-semibold text-green-600 text-lg">
						Thank you for your feedback!
					</ModalTitle>
					<ModalDescription className="text-slate-600 text-sm">
						We appreciate you taking the time to share your thoughts.
					</ModalDescription>
				</ModalHeader>
				<ModalFooter>
					<Button variant={"secondary"} onClick={clearModal}>
						Close
					</Button>
				</ModalFooter>
			</ModalContent>
		);
	}

	return (
		<form onSubmit={handleSubmit}>
			<ModalContent dismissible={false} className="flex flex-col gap-4">
				<div className="flex flex-col gap-4">
					<ModalHeader>
						<ModalTitle>We'd love your feedback!</ModalTitle>{" "}
						<ModalDescription className="text-sm">
							How would you rate your experience?
						</ModalDescription>
					</ModalHeader>
					<div className="flex gap-2">
						{[1, 2, 3, 4, 5].map((star) => (
							<button
								key={star}
								type="button"
								onClick={() => setRating(star)}
								onMouseEnter={() => setHoverRating(star)}
								onMouseLeave={() => setHoverRating(0)}
								className="rounded transition-transform hover:scale-110"
							>
								<Star
									className={cn(
										"h-8 w-8 transition-colors",
										star <= (hoverRating || rating)
											? "fill-yellow-400 text-yellow-400"
											: "text-slate-300",
									)}
								/>
							</button>
						))}
					</div>
				</div>

				<div className="space-y-2">
					<label
						htmlFor="feedback"
						className="font-medium text-slate-700 text-sm"
					>
						Additional comments (optional)
					</label>
					<Textarea
						id="feedback"
						placeholder="Tell us more about your experience..."
						value={feedback}
						onChange={(e) => setFeedback(e.target.value)}
						rows={4}
						className="resize-none"
					/>
				</div>
				{mutation.error && (
					<p className="text-red-500 text-xs">
						An error occurred while submitting, please try again!
					</p>
				)}
			</ModalContent>

			<ModalFooter className="gap-2">
				<Button
					type="submit"
					className="w-full"
					disabled={rating === 0 || mutation.isPending}
				>
					{mutation.isPending ? "Submitting..." : "Submit Feedback"}
				</Button>
				<Button
					disabled={mutation.isPending}
					variant={"secondary"}
					onClick={clearModal}
				>
					Skip 😢
				</Button>
			</ModalFooter>
		</form>
	);
};

export default FeedbackForm;
