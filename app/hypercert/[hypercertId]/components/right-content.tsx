import type { FullHypercert } from "@/app/graphql-queries/hypercerts";
import MapRenderer from "@/components/map-renderer";
import React from "react";
import Contributors from "./Contributors";
import SectionWrapper from "./SectionWrapper";
import EvaluationDetails from "./evaluation-details";

const RightContent = ({ hypercert }: { hypercert: FullHypercert }) => {
	return (
		<div className="flex w-full flex-initial flex-col gap-6 lg:w-auto lg:flex-[2]">
			{hypercert.uri && (
				<SectionWrapper title={"Site Boundaries"}>
					<div className="flex w-full items-center justify-center">
						<MapRenderer uri={hypercert.uri} />
					</div>
				</SectionWrapper>
			)}
			<Contributors hypercert={hypercert} />
			{/* <SectionWrapper title={"Verification"}>
				<EvaluationDetails hypercert={hypercert} />
			</SectionWrapper> */}
		</div>
	);
};

export default RightContent;
