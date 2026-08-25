/**
 * Hardcoded site-boundary geoJSONs used as a fallback when the IPFS gateway
 * fails to serve the boundary at view time. Keyed by the geoJSON's IPFS CID.
 *
 * "XPRF 100HA Test Plot" is the site of the GainForest XPRIZE Rainforest
 * "Most Impact" Winner ecocert — the same "Plot 2" site mapped by the
 * XPRIZE Rainforest Finals organization on gainforest.app
 * (did:plc:axibb3hd3od3635jhihwmohv).
 */
export const SITE_BOUNDARY_FALLBACKS: Record<string, GeoJSON.GeoJSON> = {
	QmRPnaqRcYm2fLXVuP3GAktScjK9zXjPRqhScLCy8K3esD: {
		type: "FeatureCollection",
		features: [
			{
				type: "Feature",
				properties: {
					Name: "XPRF 100HA Test Plot",
				},
				geometry: {
					type: "Polygon",
					coordinates: [
						[
							[-60.7364219352658, -2.96672028579691],
							[-60.7369925074095, -2.9547270961423],
							[-60.7437596146056, -2.95500829564305],
							[-60.7431807751436, -2.96706871116094],
							[-60.7364219352658, -2.96672028579691],
						],
					],
				},
			},
		],
	},
};

/**
 * Returns the hardcoded fallback boundary for a geoJSON URL, if one exists.
 * Matches by checking whether the URL contains a known CID.
 */
export const getSiteBoundaryFallback = (
	geojsonURL: string,
): GeoJSON.GeoJSON | undefined => {
	const cid = Object.keys(SITE_BOUNDARY_FALLBACKS).find((key) =>
		geojsonURL.includes(key),
	);
	return cid ? SITE_BOUNDARY_FALLBACKS[cid] : undefined;
};
