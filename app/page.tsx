import Image from "next/image";

import edgeEsmeralda from "@/assets/EdgeEsmeralda.svg";
import hero from "@/assets/EdgeEsmeraldaHero.webp";
import noReportsImage from "@/assets/history-bg.svg";

import { ReportsView } from "@/components/reports/reports-view";
import VoicedeckStats from "@/components/reports/voicedeck-stats";
import { siteConfig } from "@/config/site";
import { FilterProvider } from "@/contexts/filter";
import { getNumberOfContributors } from "@/lib/directus";
import { fetchReports } from "@/lib/impact-reports";
import type { Report } from "@/types";
import { fetchHypercerts } from "@/utils/supabase/hypercerts";
import { createClient } from "@/utils/supabase/server";

export default async function ReportsPage() {
	let uniqueReports: Report[];
	let numOfContributors: number;
	try {
		const reports: Report[] = await fetchReports();
		uniqueReports = reports.reduce((acc, report) => {
			const reportExists = acc.find((r) => r.cmsId === report.cmsId);
			if (!reportExists) {
				acc.push(report);
			}
			return acc;
		}, [] as Report[]);
		numOfContributors = await getNumberOfContributors();
	} catch (error) {
		console.error("Failed to fetch reports:", error);
		throw new Error("Failed to fetch reports");
	}

	const { data, error } = await fetchHypercerts();
	console.log("SUPABASE TEST", data);
	console.log("SUPABASE Error", error);

	// const supabase = createClient();
	// const hypercertIds = [
	// 	"11155111-0xa16DFb32Eb140a6f3F2AC68f41dAd8c7e83C4941-31986542490568215565557213098586211876864",
	// 	"11155111-0xa16DFb32Eb140a6f3F2AC68f41dAd8c7e83C4941-31646260123647277102093838491154443665408",
	// ];

	// const { data: hypercerts, error } = await supabase
	// 	.from("claims")
	// 	.select(`
	//   *,
	//   metadata (
	// 	allow_list_uri,
	// 	contributors,
	// 	description,
	// 	external_url,
	// 	id,
	// 	image,
	// 	impact_scope,
	// 	impact_timeframe_from,
	// 	impact_timeframe_to,
	// 	name,
	// 	parsed,
	// 	properties,
	// 	rights,
	// 	uri,
	// 	work_scope,
	// 	work_timeframe_from,
	// 	work_timeframe_to
	//   ),
	//   fractions!inner (id,units, owner_address)
	// `)
	// 	.in("hypercert_id", hypercertIds);

	// console.log("SUPABASE TEST", hypercerts);
	// console.log("SUPABASE Error", error);

	return (
		<main className="flex flex-col gap-4 pb-[64px] md:pb-0">
			<section className="flex flex-col items-center gap-4 p-4 md:p-8">
				<header className="relative flex h-[420px] w-full max-w-screen-xl flex-col justify-end gap-4 overflow-hidden rounded-3xl p-4 text-vd-beige-100 2xl:h-[520px] min-[2560px]:h-[720px] min-[2560px]:max-w-screen-2xl 2xl:p-16 md:p-8">
					<Image
						className="-z-10 bg-center object-cover opacity-60"
						src={hero}
						alt="Hero Image"
						placeholder="blur"
						sizes="(min-width: 2560px) 1536px, (min-width: 1400px) 1280px, 93.7vw"
						fill
						priority
					/>
					<Image
						className="self-center"
						src={edgeEsmeralda}
						alt="Edge Esmeralda"
						height={200}
						width={800}
					/>
					{/* <h1 className="text-3xl lg:text-5xl 2xl:text-7xl font-bold text-left max-w-screen-md 2xl:max-w-screen-lg">
						{siteConfig.title}
					</h1> */}
					<p className="max-w-screen-md self-center py-6 text-left font-semibold text-2xl text-black 2xl:max-w-screen-lg 2xl:text-4xl">
						{siteConfig.description}
					</p>
				</header>
				<VoicedeckStats
					numOfContributors={numOfContributors}
					reports={uniqueReports}
				/>
			</section>

			{uniqueReports.length ? (
				<FilterProvider>
					<ReportsView hypercerts={data} reports={uniqueReports} />
				</FilterProvider>
			) : (
				<section className="flex w-full flex-col items-center gap-4 pt-6 pb-24 md:pb-6">
					<div className="relative h-20 w-full md:h-40">
						<Image fill src={noReportsImage} alt="circular pattern" />
					</div>
					<div className="text-center font-bold text-vd-beige-600 text-xl">
						<p>Sorry, something went wrong.</p>
						<p>Reports cannot be displayed right now.</p>
					</div>
				</section>
			)}
		</main>
	);
}
