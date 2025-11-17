import type { Feedback } from "../../actions";
import { StarRating } from "../star-rating";

export default function FeedbackCard({ feedback }: { feedback: Feedback }) {
	return (
		<article className="flex flex-col gap-2 rounded-lg border bg-white p-4 shadow-sm">
			<div className="flex items-center justify-between gap-2">
				<StarRating rating={feedback.rating} />
				{feedback.created_at && (
					<span className="text-slate-400 text-xs">
						{new Date(feedback.created_at).toLocaleDateString()}
					</span>
				)}
			</div>

			<p className="text-slate-700 text-sm">
				{feedback.feedback && feedback.feedback.trim().length > 0
					? feedback.feedback
					: "No written feedback."}
			</p>
		</article>
	);
}
