import PageError from "@/app/components/shared/PageError";
import Progress from "@/app/components/shared/progress";
import {
	type FullHypercert,
	fetchFullHypercertById,
} from "@/app/graphql-queries/hypercerts";
import { catchError } from "@/app/utils";
import { Button } from "@/components/ui/button";
import { MotionWrapper } from "@/components/ui/motion-wrapper";
import { Separator } from "@/components/ui/separator";
import type { ApiError } from "@/types/api";
import { ArrowUpRight, ChevronLeft } from "lucide-react";
import Link from "next/link";
import React from "react";
import FundingView from "./components/FundingView";
import CopyButton from "./components/copy-button";
import LeftContent from "./components/left-content";
import RightContent from "./components/right-content";
import { FullHypercertProvider } from "./contexts/full-hypercert";

export const dynamic = "force-dynamic";

type PageProps = {
	params: { hypercertId: string };
};

// const getCachedHypercert = unstable_cache(
// 	async (hypercertId: string) => fetchFullHypercertById(hypercertId),
// 	["full-hypercert"],
// 	{
// 		revalidate: 10,
// 	},
// );

const Page = async ({ params }: PageProps) => {
	const { hypercertId } = params;
	const [error, hypercert] = await catchError<FullHypercert, ApiError>(
		fetchFullHypercertById(hypercertId),
	);

	if (error) {
		return (
			<PageError
				title="We couldn't load the hypercert data."
				body="Please try refreshing the page or check the URL."
			/>
		);
	}

	return (
		<FullHypercertProvider value={hypercert}>
			<MotionWrapper
				type="main"
				className="flex w-full flex-col items-center justify-start"
				initial={{ opacity: 0, filter: "blur(10px)" }}
				animate={{ opacity: 1, filter: "blur(0px)" }}
				transition={{ duration: 0.5 }}
			>
				<div className="flex w-full max-w-6xl flex-col gap-2 p-8">
					<Link href={"/"}>
						<Button variant={"link"} className="gap-2 p-0">
							<ChevronLeft size={20} /> View all ecocerts
						</Button>
					</Link>
					<div className="flex flex-col justify-start gap-4 md:flex-row md:justify-between">
						<div className="flex flex-col gap-2">
							<h1 className="font-baskerville font-bold text-4xl leading-tight">
								{hypercert.metadata.name ?? "Untitled"}
							</h1>
							<ul className="mt-1 flex flex-wrap items-center gap-2">
								{hypercert.metadata.work.scope.map((scope, i) => (
									<li
										key={scope.toLowerCase()}
										className="rounded-full bg-beige-muted px-3 py-1 text-beige-muted-foreground"
									>
										{scope}
									</li>
								))}
							</ul>
							<div className="mt-1 flex items-center gap-2 text-muted-foreground text-sm">
								<CopyButton text={hypercertId} />
								<Link
									href={`https://app.hypercerts.org/hypercerts/${hypercertId}`}
									target="_blank"
								>
									<Button variant={"link"} size={"sm"} className="gap-2">
										<span>View at app.hypercerts</span>
										<ArrowUpRight size={16} />
									</Button>
								</Link>
							</div>
						</div>
						<FundingView hypercert={hypercert} />
					</div>
					<div className="hidden w-full md:mt-1 md:block">
						<Separator className="bg-beige-muted-foreground/20" />
					</div>
					<section className="mt-4 flex flex-col items-start gap-4 lg:flex-row lg:gap-8">
						<LeftContent hypercert={hypercert} />
						<RightContent hypercert={hypercert} />
					</section>
				</div>
			</MotionWrapper>
		</FullHypercertProvider>
	);
};

export default Page;
