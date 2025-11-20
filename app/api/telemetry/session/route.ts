import { NextResponse } from "next/server";
import { z } from "zod";

import { getServiceSupabaseClient } from "@/lib/supabase/server";

const SessionRequestSchema = z.object({
	sessionId: z.string().uuid().optional(),
	walletAddress: z.string().optional(),
});

export async function POST(request: Request) {
	const requestJson = await request.json().catch(() => ({}));
	const parsed = SessionRequestSchema.safeParse(requestJson);

	if (!parsed.success) {
		return NextResponse.json(
			{ error: "Invalid request body" },
			{ status: 400 },
		);
	}

	const { sessionId, walletAddress } = parsed.data;
	const supabase = getServiceSupabaseClient();
	const now = new Date().toISOString();

	if (sessionId) {
		await supabase
			.from("telemetry_sessions")
			.update({ last_seen: now, wallet_address: walletAddress ?? null })
			.eq("id", sessionId);
		return NextResponse.json({ sessionId });
	}

	const newSessionId = crypto.randomUUID();
	const userAgent = request.headers.get("user-agent");
	const referer =
		request.headers.get("referer") ?? request.headers.get("referrer");

	await supabase.from("telemetry_sessions").insert({
		id: newSessionId,
		created_at: now,
		last_seen: now,
		wallet_address: walletAddress ?? null,
		user_agent: userAgent,
		referrer: referer,
	});

	return NextResponse.json({ sessionId: newSessionId });
}
