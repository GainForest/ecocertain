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
	// currently kept the limit as 100 without any pagination. once we cross 15-20 entries we can create an infinite pagination/client pagination
	const feedbackList = (await getFeedback({
		limit: 100,
		offset: 0,
	})) as Feedback[];

	return (
		<main className="mx-auto my-6 flex max-w-7xl flex-col gap-4 px-5 pb-[64px] md:pb-0">
			<h1 className="font-extrabold text-lg">Feedback</h1>
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
