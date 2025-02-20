// components/MapRenderer.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getMetadata } from "@/utils/metadata";
import { type HypercertMetadata, validateMetaData } from "@hypercerts-org/sdk";
import { CircleAlert, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface MapRendererProps {
	uri: string;
}

export type MapData = {
	baseUrl: string;
	metadata: HypercertMetadata;
};

type ValidatedProperties = {
	properties: Array<{
		trait_type: string;
		type: string;
		src: string;
		name: string;
	}>;
};

export default function MapRenderer({ uri }: MapRendererProps) {
	const [mapData, setMapData] = useState<MapData | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function fetchMapData(uri: string) {
			try {
				const res = await getMetadata(uri);
				const { data } = res;
				const metadata = data;

				const validationResult = validateMetaData(metadata);
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
				const _baseUrl = `https://www.gainforest.app/?geojsonURL=https://gateway.pinata.cloud/ipfs/${cid}`;

				setMapData({
					baseUrl: _baseUrl,
					metadata: validationResult.data as HypercertMetadata,
				});
			} catch (error) {
				console.error(error);
				setError("Error rendering map");
			}
		}

		if (!uri) return;
		fetchMapData(uri);
	}, [uri]);

	return (
		<div className="flex aspect-square h-auto min-h-[300px] w-full max-w-[400px] flex-col items-center justify-center gap-2 overflow-hidden rounded-xl md:max-w-full">
			{error ? (
				<>
					<CircleAlert className="mb-4 text-muted-foreground/75" size={50} />
					<p className="text-muted-foreground">An error occured.</p>
				</>
			) : mapData ? (
				mapData.baseUrl ? (
					<iframe
						height="500"
						width="500"
						src={mapData.baseUrl}
						title={`GeoJSON for ${mapData.metadata.name}`}
						className="h-full w-full"
					/>
				) : (
					<>
						<CircleAlert className="mb-4 text-muted-foreground/75" size={50} />
						<p className="text-muted-foreground">No map found</p>
					</>
				)
			) : (
				<>
					<Loader2
						className="mb-4 animate-spin text-muted-foreground/75"
						size={40}
					/>
					<p className="text-muted-foreground">Loading map...</p>
				</>
			)}
		</div>
	);
}
