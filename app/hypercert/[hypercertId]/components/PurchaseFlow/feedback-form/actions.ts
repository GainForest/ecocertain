"use server";

export interface InsertFeedbackPayload {
	rating: number;
	feedback?: string;
}
export async function insertFeedback(feedback: InsertFeedbackPayload) {
	if (!process.env.SUPABASE_URL) {
		throw new Error("supabase url not set");
	}
	const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
	if (!serviceKey) {
		throw new Error("Supabase key not set");
	}
	const url = `${process.env.SUPABASE_URL}/rest/v1/purchase_feedback`;
	await fetch(url, {
		method: "POST",
		headers: {
			apiKey: serviceKey,
			Authorization: `Bearer ${serviceKey}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify(feedback),
	});
}
