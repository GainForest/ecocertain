"use client";

import { Button } from "@/components/ui/button";
import QuickTooltip from "@/components/ui/quicktooltip";
import { generateEcocertainIPFSUrl, getMetadata } from "@/utils/metadata";
import { validateMetaData } from "@hypercerts-org/sdk";
import type { HypercertMetadata } from "@hypercerts-org/sdk";
import { useQuery } from "@tanstack/react-query";
import {
	Brackets,
	CircleAlert,
	Download,
	FileJson2,
	Loader2,
} from "lucide-react";
import Link from "next/link";
import React from "react";
import SectionWrapper from "./SectionWrapper";

type ValidatedProperties = {
	properties: Array<{
		trait_type: string;
		type: string;
		src: string;
		name: string;
	}>;
};

const getMapDataFromHypercertCID = async (
	hypercertCID: string,
): Promise<{
	geojsonURL: string;
	mapPreviewURL: string;
	metadata: HypercertMetadata;
} | null> => {
	try {
		const res = await getMetadata(hypercertCID);
		const { data } = res;

		const validationResult = validateMetaData(data);
		if (!validationResult.valid) {
			throw new Error("Invalid metadata");
		}
		// Type assertion since we've validated the data
		const validatedData = validationResult.data as ValidatedProperties;

		// Find the property with trait_type "geoJSON"
		const geoJSONProperty = validatedData.properties.find(
			(prop) => prop.trait_type === "geoJSON",
		);

		if (!geoJSONProperty) {
			throw new Error("No site boundary found");
		}

		const geoJSONUri = geoJSONProperty.src;

		const cidRegex = /^ipfs:\/\/(.+)$/;
		const match = geoJSONUri.match(cidRegex);

		if (!match) {
			throw new Error("Invalid IPFS URI format");
		}

		const cid = match[1];
		const geojsonURL = generateEcocertainIPFSUrl(cid);
		const mapPreviewURL = `https://legacy.gainforest.app/?shapefile=${geojsonURL}&showUI=false`;
		const metadata = validationResult.data as HypercertMetadata;
		return {
			geojsonURL,
			mapPreviewURL,
			metadata,
		};
	} catch (error) {
		console.error("Error getting map data from hypercert CID", error);
		return null;
	}
};

const SiteBoundaries = ({ hypercertCID }: { hypercertCID: string }) => {
	const { data: mapData, isLoading } = useQuery({
		queryKey: ["mapData", hypercertCID],
		queryFn: () => getMapDataFromHypercertCID(hypercertCID),
	});

	return (
		<SectionWrapper
			title={"Site Boundaries"}
			titleRight={
				mapData && (
					<QuickTooltip asChild content="View GeoJSON File">
						<Link href={mapData.geojsonURL} target="_blank">
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
					{!mapData ? (
						<>
							<CircleAlert
								className="mb-4 text-muted-foreground/75"
								size={50}
							/>
							<p className="text-muted-foreground">An error occured.</p>
						</>
					) : isLoading ? (
						<>
							<Loader2
								className="mb-4 animate-spin text-muted-foreground/75"
								size={40}
							/>
							<p className="text-muted-foreground">Loading map...</p>
						</>
					) : (
						<iframe
							height="500"
							width="500"
							src={mapData.mapPreviewURL}
							title={`GeoJSON for ${mapData.metadata.name}`}
							className="h-full w-full"
						/>
					)}
				</div>
			</div>
		</SectionWrapper>
	);
};

export default SiteBoundaries;
