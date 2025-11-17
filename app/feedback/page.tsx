import { siteConfig } from "@/config/site";
import type { Metadata } from "next";
import { type Feedback, getFeedback } from "./actions";
import FeedbackCard from "./components/feedback-card";

export const metadata: Metadata = {
	title: `${siteConfig.name} | Feedback`,
	robots: {
		index: false,
	},
};

export default async function FeedbackView() {
	const feedbackList = (await getFeedback({
		limit: 100,
		offset: 0,
	})) as Feedback[];

	return (
		<main className="mx-auto flex max-w-7xl flex-col gap-4 pb-[64px] md:pb-0">
			<h1 className="mt-6 font-extrabold text-lg">Feedback</h1>

			{feedbackList.length === 0 ? (
				<p className="text-slate-500 text-sm">No feedback yet.</p>
			) : (
				<section className="grid gap-4 lg:grid-cols-3 md:grid-cols-2">
					{feedbackList.map((feedback) => (
						<FeedbackCard key={feedback.id} feedback={feedback} />
					))}
				</section>
			)}
		</main>
	);
}
