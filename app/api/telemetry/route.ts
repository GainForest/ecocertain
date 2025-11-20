import { NextResponse } from "next/server";
import { z } from "zod";

import { getServiceSupabaseClient } from "@/lib/supabase/server";

const walletEventSchema = z.object({
	type: z.literal("wallet"),
	sessionId: z.string().uuid(),
	event: z.enum(["connect", "disconnect", "chain_switch", "error"]),
	walletAddress: z.string().optional(),
	chainId: z.number().optional(),
	connector: z.string().optional(),
	message: z.string().optional(),
	context: z.record(z.any()).optional(),
	timestamp: z.string(),
});

const formEventSchema = z.object({
	type: z.literal("form"),
	sessionId: z.string().uuid(),
	submissionId: z.string().optional(),
	step: z.string(),
	status: z.enum(["started", "in_progress", "completed", "error"]),
	hypercertId: z.string().optional(),
	context: z.record(z.any()).optional(),
	timestamp: z.string(),
});

const lifiEventSchema = z.object({
	type: z.literal("lifi_swap"),
	sessionId: z.string().uuid(),
	hypercertId: z.string(),
	event: z.enum(["route_started", "route_completed", "route_failed"]),
	routeId: z.string().optional(),
	fromChainId: z.number().optional(),
	toChainId: z.number().optional(),
	fromToken: z.string().optional(),
	toToken: z.string().optional(),
	amountIn: z.number().optional(),
	amountOut: z.number().optional(),
	durationMs: z.number().optional(),
	errorLabel: z.string().optional(),
	context: z.record(z.any()).optional(),
	timestamp: z.string(),
});

const paymentEventSchema = z.object({
	type: z.literal("payment_flow"),
	sessionId: z.string().uuid(),
	hypercertId: z.string(),
	orderId: z.string(),
	stepIndex: z.number(),
	stepName: z.string(),
	status: z.enum(["in_progress", "completed", "error"]),
	txHash: z.string().optional(),
	context: z.record(z.any()).optional(),
	timestamp: z.string(),
});

const requestSchema = z.object({
	events: z.array(
		z.discriminatedUnion("type", [
			walletEventSchema,
			formEventSchema,
			lifiEventSchema,
			paymentEventSchema,
		]),
	),
});

export async function POST(request: Request) {
	const body = await request.json().catch(() => null);
	const parsed = requestSchema.safeParse(body);

	if (!parsed.success) {
		return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
	}

	const supabase = getServiceSupabaseClient();
	const { events } = parsed.data;

	const walletEvents = events.filter(
		(event): event is z.infer<typeof walletEventSchema> =>
			event.type === "wallet",
	);
	const formEvents = events.filter(
		(event): event is z.infer<typeof formEventSchema> => event.type === "form",
	);
	const lifiEvents = events.filter(
		(event): event is z.infer<typeof lifiEventSchema> =>
			event.type === "lifi_swap",
	);
	const paymentEvents = events.filter(
		(event): event is z.infer<typeof paymentEventSchema> =>
			event.type === "payment_flow",
	);

	if (walletEvents.length > 0) {
		await supabase.from("wallet_events").insert(
			walletEvents.map((event) => ({
				session_id: event.sessionId,
				wallet_address: event.walletAddress?.toLowerCase() ?? null,
				chain_id: event.chainId ?? null,
				connector: event.connector ?? null,
				event_type: event.event,
				context: event.context ?? null,
				message: event.message ?? null,
				occurred_at: event.timestamp,
			})),
		);
	}

	if (formEvents.length > 0) {
		await supabase.from("form_events").insert(
			formEvents.map((event) => ({
				session_id: event.sessionId,
				submission_id: event.submissionId ?? null,
				step: event.step,
				status: event.status,
				hypercert_id: event.hypercertId ?? null,
				context: event.context ?? null,
				occurred_at: event.timestamp,
			})),
		);
	}

	if (lifiEvents.length > 0) {
		await supabase.from("lifi_swap_events").insert(
			lifiEvents.map((event) => ({
				session_id: event.sessionId,
				hypercert_id: event.hypercertId,
				event_type: event.event,
				route_id: event.routeId ?? null,
				from_chain_id: event.fromChainId ?? null,
				to_chain_id: event.toChainId ?? null,
				from_token: event.fromToken ?? null,
				to_token: event.toToken ?? null,
				amount_in: event.amountIn ?? null,
				amount_out: event.amountOut ?? null,
				duration_ms: event.durationMs ?? null,
				error_label: event.errorLabel ?? null,
				context: event.context ?? null,
				occurred_at: event.timestamp,
			})),
		);
	}

	if (paymentEvents.length > 0) {
		await supabase.from("payment_flow_events").insert(
			paymentEvents.map((event) => ({
				session_id: event.sessionId,
				hypercert_id: event.hypercertId,
				order_id: event.orderId,
				step_index: event.stepIndex,
				step_name: event.stepName,
				status: event.status,
				tx_hash: event.txHash ?? null,
				context: event.context ?? null,
				occurred_at: event.timestamp,
			})),
		);
	}

	return NextResponse.json({ status: "ok" });
}
