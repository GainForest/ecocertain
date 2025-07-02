import Progress from "@/app/components/shared/progress";
import { FullHypercertProvider } from "@/app/contexts/full-hypercert";
import { Button } from "@/components/ui/button";
import { MotionWrapper } from "@/components/ui/motion-wrapper";
import { fetchFullHypercertById } from "@/graphql/hypercerts/queries/hypercerts";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import AttestationsList from "./components/AttestationsList";

type PageProps = {
	params: Promise<{ hypercertId: string }>;
};

export default async function HypercertProofOfImpactPage({
	params,
}: PageProps) {
	const { hypercertId } = await params;
	const hypercert = await fetchFullHypercertById(hypercertId);

	if (!hypercert) {
		return <Progress percentage={0} />;
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
				<div className="flex w-full max-w-6xl flex-col gap-2 p-3 md:p-8">
					<Link href={`/hypercert/${hypercertId}`}>
						<Button variant={"link"} className="gap-2 p-0">
							<ChevronLeft size={20} /> Back to hypercert
						</Button>
					</Link>
					<div className="w-full">
						<h1 className="mb-8 text-balance text-center font-baskerville font-bold text-3xl">
							<i className="text-2xl text-beige-muted-foreground">
								Proof of Impact for
							</i>
							<br />
							<span>{hypercert.metadata.name}</span>
						</h1>
						<AttestationsList attestations={hypercert.attestations} />
					</div>
				</div>
			</MotionWrapper>
		</FullHypercertProvider>
	);
}
