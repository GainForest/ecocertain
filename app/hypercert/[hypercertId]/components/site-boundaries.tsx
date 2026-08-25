"use client";

import { Button } from "@/components/ui/button";
import QuickTooltip from "@/components/ui/quicktooltip";
import type { FullHypercert } from "@/graphql/hypercerts/queries/hypercerts";
import { generateEcocertainIPFSUrl } from "@/utils/metadata";
import { CircleAlert, FileJson2 } from "lucide-react";
import Link from "next/link";
import React from "react";
import SectionWrapper from "./SectionWrapper";

/**
 * Resolves the geoJSON pointer stored on the hypercert metadata into a
 * gateway URL. Accepts both `ipfs://<cid>` values and plain https URLs.
 */
const resolveGeoJSONUrl = (uri: string): string | null => {
	const ipfsMatch = uri.match(/^ipfs:\/\/(.+)$/);
	if (ipfsMatch) {
		return generateEcocertainIPFSUrl(ipfsMatch[1]);
	}
	if (uri.startsWith("http://") || uri.startsWith("https://")) {
		return uri;
	}
	return null;
};

const SiteBoundaries = ({
	geoJSON,
	name,
}: {
	geoJSON: FullHypercert["metadata"]["geoJSON"];
	name?: string;
}) => {
	const geojsonURL = geoJSON ? resolveGeoJSONUrl(geoJSON.uri) : null;
	const mapPreviewURL = geojsonURL
		? `https://legacy.gainforest.app/?shapefile=${geojsonURL}&showUI=false`
		: null;

	return (
		<SectionWrapper
			title={"Site Boundaries"}
			titleRight={
				geojsonURL && (
					<QuickTooltip asChild content="View GeoJSON File">
						<Link href={geojsonURL} target="_blank">
							<Button variant={"outline"} size={"sm"}>
								<FileJson2 size={16} />
							</Button>
						</Link>
					</QuickTooltip>
				)
			}
		>
			<div className="flex w-full items-center justify-center">
				<div className="flex aspect-square h-auto min-h-[300px] w-full max-w-[400px] flex-col items-center justify-center gap-2 overflow-hidden rounded-xl">
					{!mapPreviewURL ? (
						<>
							<CircleAlert
								className="mb-4 text-muted-foreground/75"
								size={50}
							/>
							<p className="text-muted-foreground">
								No site boundary available.
							</p>
						</>
					) : (
						<iframe
							height="500"
							width="500"
							src={mapPreviewURL}
							title={`GeoJSON for ${name ?? "hypercert"}`}
							className="h-full w-full"
						/>
					)}
				</div>
			</div>
		</SectionWrapper>
	);
};

export default SiteBoundaries;
