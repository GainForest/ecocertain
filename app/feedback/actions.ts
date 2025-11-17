"use server";
export interface GetFeedbackParams {
	limit?: number;
	offset?: number;
}

export interface Feedback {
	id: string;
	created_at: string;
	rating: number;
	feedback?: string;
}

export async function getFeedback({
	limit = 10,
	offset = 0,
}: GetFeedbackParams = {}) {
	if (!process.env.SUPABASE_URL) {
		throw new Error("supabase url not set");
	}
	const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
	if (!serviceKey) {
		throw new Error("Supabase key not set");
	}

	const baseUrl = `${process.env.SUPABASE_URL}/rest/v1/purchase_feedback`;

	const params = new URLSearchParams({
		select: "*",
		limit: String(limit),
		offset: String(offset),
		order: "created_at.desc",
	});

	const res = await fetch(`${baseUrl}?${params.toString()}`, {
		method: "GET",
		headers: {
			apiKey: serviceKey,
			Authorization: `Bearer ${serviceKey}`,
			"Content-Type": "application/json",
		},
	});

	if (!res.ok) {
		throw new Error(
			`Failed to fetch feedback: ${res.status} ${res.statusText}`,
		);
	}

	return res.json();
}
