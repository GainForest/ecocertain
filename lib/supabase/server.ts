import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/types/hypercerts-data-database";

let cachedClient:
	| ReturnType<typeof createClient<Database>>
	| null = null;

const getSupabaseEnv = () => {
	const url = process.env.SUPABASE_URL;
	const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

	if (!url || !serviceKey) {
		throw new Error(
			"SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not configured",
		);
	}

	return { url, serviceKey };
};

export const getServiceSupabaseClient = () => {
	if (cachedClient) {
		return cachedClient;
	}

	const { url, serviceKey } = getSupabaseEnv();
	cachedClient = createClient<Database>(url, serviceKey, {
		auth: {
			persistSession: false,
		},
	});

	return cachedClient;
};
