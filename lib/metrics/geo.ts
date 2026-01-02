import { getServiceSupabaseClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/hypercerts-data-database";

export type GeoMetrics = {
	lastUpdated: string;
	totalHectares: number;
	countriesRepresented: number;
	priorityRegionProjects: number;
	topCountries: Array<{ name: string; count: number }>;
};

const PRIORITY_CONTINENTS = new Set(["Africa", "Asia", "South America"]);
const CONTINENT_COUNTRY_CODES = {
	Africa: [
		"AO",
		"BF",
		"BI",
		"BJ",
		"BW",
		"CD",
		"CF",
		"CG",
		"CI",
		"CM",
		"CV",
		"DJ",
		"DZ",
		"EG",
		"EH",
		"ER",
		"ET",
		"GA",
		"GH",
		"GM",
		"GN",
		"GQ",
		"GW",
		"KE",
		"KM",
		"LR",
		"LS",
		"LY",
		"MA",
		"MG",
		"ML",
		"MR",
		"MU",
		"MW",
		"MZ",
		"NA",
		"NE",
		"NG",
		"RE",
		"RW",
		"SC",
		"SD",
		"SL",
		"SN",
		"SO",
		"SS",
		"ST",
		"SZ",
		"TD",
		"TG",
		"TN",
		"TZ",
		"UG",
		"YT",
		"ZA",
		"ZM",
		"ZW",
	],
	Asia: [
		"AF",
		"AM",
		"AZ",
		"BH",
		"BD",
		"BN",
		"BT",
		"CN",
		"GE",
		"HK",
		"ID",
		"IL",
		"IN",
		"IQ",
		"IR",
		"JO",
		"JP",
		"KG",
		"KH",
		"KP",
		"KR",
		"KW",
		"KZ",
		"LA",
		"LB",
		"LK",
		"MM",
		"MN",
		"MO",
		"MV",
		"MY",
		"NP",
		"OM",
		"PH",
		"PK",
		"PS",
		"QA",
		"SA",
		"SG",
		"SY",
		"TH",
		"TJ",
		"TL",
		"TM",
		"TR",
		"TW",
		"UZ",
		"VN",
		"YE",
	],
	Europe: [
		"AD",
		"AL",
		"AT",
		"AX",
		"BA",
		"BE",
		"BG",
		"BY",
		"CH",
		"CY",
		"CZ",
		"DE",
		"DK",
		"EE",
		"ES",
		"FI",
		"FO",
		"FR",
		"GB",
		"GG",
		"GI",
		"GR",
		"HR",
		"HU",
		"IE",
		"IM",
		"IS",
		"IT",
		"JE",
		"LI",
		"LT",
		"LU",
		"LV",
		"MC",
		"MD",
		"ME",
		"MK",
		"MT",
		"NL",
		"NO",
		"PL",
		"PT",
		"RO",
		"RS",
		"RU",
		"SE",
		"SI",
		"SK",
		"SM",
		"UA",
		"VA",
		"XK",
	],
	"North America": [
		"AG",
		"AI",
		"AW",
		"BB",
		"BL",
		"BM",
		"BS",
		"BZ",
		"CA",
		"CR",
		"CU",
		"CW",
		"DM",
		"DO",
		"GD",
		"GL",
		"GP",
		"GT",
		"HN",
		"HT",
		"JM",
		"KN",
		"LC",
		"MF",
		"MQ",
		"MS",
		"MX",
		"NI",
		"PA",
		"PR",
		"SV",
		"SX",
		"TC",
		"TT",
		"US",
		"VC",
		"VG",
		"VI",
	],
	"South America": [
		"AR",
		"BO",
		"BR",
		"CL",
		"CO",
		"EC",
		"FK",
		"GF",
		"GS",
		"GY",
		"PE",
		"PY",
		"SR",
		"UY",
		"VE",
	],
	Oceania: [
		"AS",
		"AU",
		"CK",
		"FJ",
		"FM",
		"GU",
		"KI",
		"MH",
		"MP",
		"NC",
		"NR",
		"NU",
		"NZ",
		"PF",
		"PG",
		"PN",
		"PW",
		"SB",
		"TK",
		"TO",
		"TV",
		"UM",
		"VU",
		"WF",
		"WS",
	],
	Antarctica: ["AQ"],
} as const;

const normalizeCountryName = (value: string) =>
	value
		.trim()
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^a-z]/g, "");

const regionDisplayNames =
	typeof Intl !== "undefined" && typeof Intl.DisplayNames !== "undefined"
		? new Intl.DisplayNames(["en"], { type: "region" })
		: undefined;

const COUNTRY_CODE_TO_CONTINENT = new Map<string, string>();
const COUNTRY_NAME_TO_CONTINENT = new Map<string, string>();

const addCountryNameMapping = (name: string, continent: string) => {
	const normalized = normalizeCountryName(name);
	if (normalized.length > 0) {
		COUNTRY_NAME_TO_CONTINENT.set(normalized, continent);
	}
};

for (const [continent, codes] of Object.entries(CONTINENT_COUNTRY_CODES)) {
	for (const code of codes) {
		const uppercaseCode = code.toUpperCase();
		COUNTRY_CODE_TO_CONTINENT.set(uppercaseCode, continent);
		if (regionDisplayNames) {
			const displayName = regionDisplayNames.of(uppercaseCode);
			if (displayName) {
				addCountryNameMapping(displayName, continent);
			}
		}
	}
}

const COUNTRY_NAME_OVERRIDES: Record<string, string> = {
	"Bolivarian Republic of Venezuela": "South America",
	"Cote d'Ivoire": "Africa",
	"Democratic Republic of the Congo": "Africa",
	"Federated States of Micronesia": "Oceania",
	"Ivory Coast": "Africa",
	"Lao People's Democratic Republic": "Asia",
	"Republic of the Congo": "Africa",
	"Timor-Leste": "Asia",
	"Vatican City": "Europe",
};

for (const [name, continent] of Object.entries(COUNTRY_NAME_OVERRIDES)) {
	addCountryNameMapping(name, continent);
}

const inferContinent = (
	row: Pick<
		Tables<"geo_enrichment">,
		"continent" | "country_code" | "country_name"
	>,
) => {
	if (row.continent) {
		return row.continent;
	}

	if (row.country_code) {
		const match = COUNTRY_CODE_TO_CONTINENT.get(row.country_code.toUpperCase());
		if (match) {
			return match;
		}
	}

	if (row.country_name) {
		const normalized = normalizeCountryName(row.country_name);
		if (normalized.length > 0) {
			const match = COUNTRY_NAME_TO_CONTINENT.get(normalized);
			if (match) {
				return match;
			}
		}
	}

	return null;
};

export const getGeoMetrics = async (): Promise<GeoMetrics> => {
	const supabase = getServiceSupabaseClient();
	const { data, error } = await supabase
		.from("geo_enrichment")
		.select("country_code,country_name,continent,hectares");

	if (error) {
		console.warn("Failed to fetch geo enrichment rows", error);
		return {
			lastUpdated: new Date().toISOString(),
			totalHectares: 0,
			countriesRepresented: 0,
			priorityRegionProjects: 0,
			topCountries: [],
		};
	}

	const rows = (data ?? []) as Array<
		Pick<
			Tables<"geo_enrichment">,
			"country_code" | "country_name" | "continent" | "hectares"
		>
	>;

	const countryCounts = new Map<string, { name: string; count: number }>();
	let hectares = 0;
	let priorityCount = 0;

	for (const row of rows) {
		hectares += row.hectares ?? 0;
		const inferredContinent = inferContinent(row);
		if (inferredContinent && PRIORITY_CONTINENTS.has(inferredContinent)) {
			priorityCount += 1;
		}

		const code = row.country_code ?? row.country_name ?? "Unknown";
		const entry = countryCounts.get(code) ?? {
			name: row.country_name ?? row.country_code ?? "Unknown",
			count: 0,
		};
		entry.count += 1;
		countryCounts.set(code, entry);
	}

	const topCountries = Array.from(countryCounts.values())
		.sort((a, b) => b.count - a.count)
		.slice(0, 5);

	return {
		lastUpdated: new Date().toISOString(),
		totalHectares: Number(hectares.toFixed(2)),
		countriesRepresented: countryCounts.size,
		priorityRegionProjects: priorityCount,
		topCountries,
	};
};
