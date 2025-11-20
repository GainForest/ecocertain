const DEFAULT_USER_AGENT =
	process.env.GEOCODER_USER_AGENT ??
	"EcocertainGeoEnricher/1.0 (contact@gainforest.earth)";

const NOMINATIM_URL =
	process.env.GEOCODER_BASE_URL ??
	"https://nominatim.openstreetmap.org/reverse";

export type ReverseGeocodeResult = {
	countryCode: string | null;
	countryName: string | null;
	admin1: string | null;
	admin2: string | null;
	locality: string | null;
	continent: string | null;
	confidence: number | null;
	raw: unknown;
};

const toTitleCase = (value?: string | null) =>
	value ? value.replace(/\b\w/g, (char) => char.toUpperCase()) : null;

export const reverseGeocode = async (
	latitude: number,
	longitude: number,
): Promise<ReverseGeocodeResult> => {
	const url = new URL(NOMINATIM_URL);
	url.searchParams.set("format", "jsonv2");
	url.searchParams.set("lat", latitude.toString());
	url.searchParams.set("lon", longitude.toString());
	url.searchParams.set("zoom", "5");
	url.searchParams.set("addressdetails", "1");

	const response = await fetch(url, {
		headers: {
			"User-Agent": DEFAULT_USER_AGENT,
			"Accept-Language": "en",
		},
	});

	if (!response.ok) {
		throw new Error(
			`Reverse geocode failed (${response.status} ${response.statusText})`,
		);
	}

	const payload = (await response.json()) as {
		address?: {
			country_code?: string;
			country?: string;
			state?: string;
			region?: string;
			county?: string;
			city?: string;
			town?: string;
			village?: string;
			continent?: string;
		};
		importance?: number;
	};

	const address = payload.address ?? {};
	const locality = address.city ?? address.town ?? address.village ?? null;

	return {
		countryCode: address.country_code
			? address.country_code.toUpperCase()
			: null,
		countryName: toTitleCase(address.country),
		admin1: toTitleCase(address.state ?? address.region),
		admin2: toTitleCase(address.county),
		locality: toTitleCase(locality),
		continent: toTitleCase(address.continent),
		confidence:
			typeof payload.importance === "number" ? payload.importance : null,
		raw: payload,
	};
};
