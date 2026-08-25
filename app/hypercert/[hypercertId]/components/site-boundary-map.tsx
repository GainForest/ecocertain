"use client";

import { useQuery } from "@tanstack/react-query";
import { CircleAlert, Loader2 } from "lucide-react";
import "mapbox-gl/dist/mapbox-gl.css";
import React, { useEffect, useRef } from "react";
import { getSiteBoundaryFallback } from "./site-boundary-fallbacks";

/**
 * Computes the [[minLng, minLat], [maxLng, maxLat]] bounds of any GeoJSON
 * object by walking its coordinates.
 */
const computeBounds = (
	geojson: unknown,
): [[number, number], [number, number]] | null => {
	let minLng = Number.POSITIVE_INFINITY;
	let minLat = Number.POSITIVE_INFINITY;
	let maxLng = Number.NEGATIVE_INFINITY;
	let maxLat = Number.NEGATIVE_INFINITY;

	const visitCoordinates = (coords: unknown): void => {
		if (!Array.isArray(coords)) return;
		if (
			coords.length >= 2 &&
			typeof coords[0] === "number" &&
			typeof coords[1] === "number"
		) {
			const [lng, lat] = coords as [number, number];
			minLng = Math.min(minLng, lng);
			minLat = Math.min(minLat, lat);
			maxLng = Math.max(maxLng, lng);
			maxLat = Math.max(maxLat, lat);
			return;
		}
		for (const child of coords) visitCoordinates(child);
	};

	// biome-ignore lint/suspicious/noExplicitAny: geojson is externally fetched
	const visitGeometry = (geometry: any): void => {
		if (!geometry) return;
		if (geometry.type === "GeometryCollection") {
			for (const g of geometry.geometries ?? []) visitGeometry(g);
			return;
		}
		visitCoordinates(geometry.coordinates);
	};

	// biome-ignore lint/suspicious/noExplicitAny: geojson is externally fetched
	const root = geojson as any;
	if (!root || typeof root !== "object") return null;
	if (root.type === "FeatureCollection") {
		for (const feature of root.features ?? []) visitGeometry(feature.geometry);
	} else if (root.type === "Feature") {
		visitGeometry(root.geometry);
	} else {
		visitGeometry(root);
	}

	if (!Number.isFinite(minLng) || !Number.isFinite(minLat)) return null;
	return [
		[minLng, minLat],
		[maxLng, maxLat],
	];
};

const fetchGeoJSON = async (url: string): Promise<unknown> => {
	try {
		const res = await fetch(url);
		if (!res.ok) {
			throw new Error(`Failed to fetch geoJSON: ${res.statusText}`);
		}
		return await res.json();
	} catch (error) {
		// Fall back to a hardcoded boundary when the gateway is unreachable.
		const fallback = getSiteBoundaryFallback(url);
		if (fallback) return fallback;
		throw error;
	}
};

/**
 * A minimal Mapbox satellite map that renders a single site boundary —
 * same satellite style and boundary colors as the full GainForest globe,
 * without its markers, layer pickers and project overlays.
 */
const SiteBoundaryMap = ({ geojsonURL }: { geojsonURL: string }) => {
	const mapContainerRef = useRef<HTMLDivElement>(null);
	const mapboxToken = process.env.NEXT_PUBLIC_MAPBOXGL_ACCESSTOKEN;

	const {
		data: geojson,
		isLoading,
		isError,
	} = useQuery({
		queryKey: ["site-boundary-geojson", geojsonURL],
		queryFn: () => fetchGeoJSON(geojsonURL),
		retry: 1,
	});

	useEffect(() => {
		if (!geojson || !mapboxToken || !mapContainerRef.current) return;
		let cancelled = false;
		let map: import("mapbox-gl").Map | undefined;

		// mapbox-gl touches window at module scope — import client-side only.
		import("mapbox-gl").then(({ default: mapboxgl }) => {
			if (cancelled || !mapContainerRef.current) return;
			mapboxgl.accessToken = mapboxToken;

			const bounds = computeBounds(geojson);
			map = new mapboxgl.Map({
				container: mapContainerRef.current,
				style: "mapbox://styles/mapbox/satellite-v9",
				...(bounds
					? { bounds, fitBoundsOptions: { padding: 40 } }
					: { center: [102, 9] as [number, number], zoom: 2 }),
			});

			map.on("load", () => {
				if (!map || cancelled) return;
				map.addSource("siteBoundary", {
					type: "geojson",
					data: geojson as GeoJSON.GeoJSON,
				});
				map.addLayer({
					id: "siteBoundaryFill",
					type: "fill",
					source: "siteBoundary",
					paint: {
						"fill-color": "#FF00FF",
						"fill-opacity": 0.15,
					},
				});
				map.addLayer({
					id: "siteBoundaryOutline",
					type: "line",
					source: "siteBoundary",
					layout: {
						"line-cap": "round",
						"line-join": "round",
					},
					paint: {
						"line-color": "#FF00FF",
						"line-width": 2,
					},
				});
			});
		});

		return () => {
			cancelled = true;
			map?.remove();
		};
	}, [geojson, mapboxToken]);

	if (isLoading) {
		return (
			<div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-muted/50">
				<Loader2
					className="mb-2 animate-spin text-muted-foreground/75"
					size={40}
				/>
				<p className="text-muted-foreground">Fetching from IPFS...</p>
			</div>
		);
	}

	if (isError || !geojson || !mapboxToken) {
		return (
			<div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-muted/50">
				<CircleAlert className="mb-2 text-muted-foreground/75" size={40} />
				<p className="text-muted-foreground">
					Couldn&apos;t load the site boundary.
				</p>
			</div>
		);
	}

	return <div ref={mapContainerRef} className="h-full w-full" />;
};

export default SiteBoundaryMap;
