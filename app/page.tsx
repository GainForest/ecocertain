import { Button } from "@/components/ui/button";
import InfoBox from "@/components/ui/info-box";
import { MotionWrapper } from "@/components/ui/motion-wrapper";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import FeedbackButton from "./components/FeedbackButton";
import HeroSection from "./components/hero-section";
import HeroTitle from "./components/hero-title";
import { HypercertsGridWrapper } from "./components/hypercerts-grid-view";
import PageError from "./components/shared/PageError";

export default async function Home() {
	return (
		<main className="flex flex-col gap-4 pb-[64px] md:pb-0">
			<div className="mt-6 flex items-center justify-center">
				<InfoBox variant="success" className="max-w-4xl">
					{/* <span className="text-base">⚠️</span>
					<p className="text-sm">
						<b>Service notice:</b> Stablecoin purchases on Ecocertain are down.
						We're working on a fix.
					</p> */}
					<span className="text-base">💬</span>
					<p className="text-green-800 text-sm">
						<b>We are building Ecocertain with you!</b> Tell us how we can
						improve your experience.
						<FeedbackButton />
					</p>
				</InfoBox>
			</div>
			<section className="flex flex-col items-center gap-4 p-8 pt-0">
				<div className="flex w-full flex-col items-center px-4">
					<HeroSection />
				</div>
			</section>

			<MotionWrapper
				type="section"
				className="flex w-full flex-col items-center"
				initial={{ opacity: 0, y: 100 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay: 0.5 }}
			>
				<Suspense
					fallback={
						<section className="flex w-full flex-col items-center gap-4 pt-6 pb-24 md:pb-6">
							<Loader2 className="animate-spin text-primary" size={40} />
							<span className="text-muted-foreground">
								Please wait while we load our favorite ecocerts...
							</span>
						</section>
					}
				>
					<HypercertsGridWrapper />
				</Suspense>
			</MotionWrapper>
		</main>
	);
}
