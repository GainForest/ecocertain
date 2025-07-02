"use client";
import { Button } from "@/components/ui/button";
import UserChip from "@/components/user-chip";
import type { FullHypercert } from "@/graphql/hypercerts/queries/hypercerts";
import autoAnimate from "@formkit/auto-animate";
import React, { useEffect, useRef, useState } from "react";
import SectionWrapper from "./SectionWrapper";

const Contributors = ({ hypercert }: { hypercert: FullHypercert }) => {
	const contributors = hypercert.metadata.contributors;

	const [viewingAll, setViewingAll] = useState(false);
	const contributorsWrapperRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (contributorsWrapperRef.current) {
			autoAnimate(contributorsWrapperRef.current);
		}
	}, []);

	return (
		<SectionWrapper title="Contributors">
			{!contributors || contributors.length === 0 ? (
				<div className="flex items-center justify-center">
					<div className="my-2 flex w-[80%] items-center justify-center text-balance text-center text-muted-foreground text-sm">
						Contributors of this hypercert would appear here.
					</div>
				</div>
			) : (
				<>
					<div
						className="flex flex-col items-center gap-1"
						ref={contributorsWrapperRef}
					>
						{contributors
							.slice(0, viewingAll ? undefined : 3)
							.map((contributor) => (
								<UserChip
									key={contributor}
									avatarSize={40}
									address={contributor as `0x${string}`}
									className="w-full text-lg"
									showCopyButton="hover"
									avatarAndLabelGap={12}
								/>
							))}
					</div>
					{contributors.length > 3 && (
						<Button
							variant={"ghost"}
							onClick={() => setViewingAll(!viewingAll)}
						>
							{viewingAll
								? "View less"
								: `View ${contributors.length - 3} more`}
						</Button>
					)}
				</>
			)}
		</SectionWrapper>
	);
};

export default Contributors;
