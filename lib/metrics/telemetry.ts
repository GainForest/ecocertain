import { getServiceSupabaseClient } from "@/lib/supabase/server";
import type {
	Tables,
	Json,
} from "@/types/hypercerts-data-database";

export type TelemetryMetrics = {
	lastUpdated: string;
	wallets: {
		monthlyActive: number;
		totalConnects: number;
		chainSwitches: number;
	};
	forms: {
		started: number;
		completed: number;
		completionRate: number;
		validationErrors: number;
	};
	swaps: {
		started: number;
		completed: number;
		completionRate: number;
		medianDurationMs: number;
		mostUsedSourceChain: string | null;
		mostUsedDestChain: string | null;
		chainPairDistribution: Array<{
			from: number;
			to: number;
			count: number;
		}>;
		popularTokenPairs: Array<{
			fromToken: string;
			toToken: string;
			count: number;
			avgAmountUSD: number;
		}>;
		averageSwapAmountUSD: number;
		totalSwapVolumeUSD: number;
		failureRate: number;
		commonFailureReasons: string[];
	};
	payments: {
		totalFlows: number;
		completedFlows: number;
		completionRate: number;
		dropOffRate: number;
	};
	uploads: {
		total: number;
		failures: number;
		successRate: number;
	};
	performance: {
		averageMintTimeSeconds: number;
		slowestSteps: Array<{
			step: string;
			avgDurationMs: number;
		}>;
		averagePaymentTimeSeconds: number;
		approvalTimeSeconds: number;
		confirmationTimeSeconds: number;
		averageUploadSizeKB: number;
		averageUploadTimeMs: number;
	};
	behavior: {
		averageEventsPerSession: number;
		bounceRate: number;
		multiChainUsers: number;
		walletDisconnectRate: number;
		returningUsers: number;
		newUsers: number;
		retentionRate: number;
		tipAcceptanceRate: number;
		tipDeclineRate: number;
	};
	onchain: {
		approvalTxCount: number;
		purchaseTxCount: number;
		tipTxCount: number;
		uniqueHypercertsFromPayments: number;
		uniqueOrdersCompleted: number;
		platformFeesCollected: number;
	};
	errors: {
		topValidationErrors: Array<{
			field: string;
			message: string;
			count: number;
		}>;
		connectionErrors: number;
		chainSwitchErrors: number;
		errorsByStep: Array<{
			step: string;
			errorCount: number;
			errorRate: number;
		}>;
		uploadErrorRate: number;
		largeFileFailures: number;
	};
	patterns: {
		peakHour: number;
		peakDay: string;
		weekdayVsWeekend: {
			weekdayEvents: number;
			weekendEvents: number;
		};
		dailyActiveUsers: number;
		weeklyActiveUsers: number;
		monthlyActiveUsers: number;
	};
	geo: {
		topReferrers: Array<{
			referrer: string;
			count: number;
			conversionRate: number;
		}>;
		topUserAgents: Array<{
			browser: string;
			count: number;
		}>;
	};
};

const thirtyDaysAgo = () => {
	const start = new Date();
	start.setDate(start.getDate() - 30);
	return start.toISOString();
};

const safeDivision = (numerator: number, denominator: number) =>
	denominator === 0 ? 0 : Number(((numerator / denominator) * 100).toFixed(1));

const median = (values: number[]) => {
	if (values.length === 0) {
		return 0;
	}
	const sorted = [...values].sort((a, b) => a - b);
	const mid = Math.floor(sorted.length / 2);
	if (sorted.length % 2 === 0) {
		return Math.round((sorted[mid - 1] + sorted[mid]) / 2);
	}
	return Math.round(sorted[mid]);
};

const extractFlowId = (context: Json, fallback: string) => {
	if (context && typeof context === "object" && "flowId" in context) {
		const { flowId } = context as { flowId?: string };
		if (typeof flowId === "string" && flowId.length > 0) {
			return flowId;
		}
	}
	return fallback;
};

export const getTelemetryMetrics = async (): Promise<TelemetryMetrics> => {
	const since = thirtyDaysAgo();
	const weekAgo = new Date();
	weekAgo.setDate(weekAgo.getDate() - 7);
	const dayAgo = new Date();
	dayAgo.setDate(dayAgo.getDate() - 1);

	const supabase = getServiceSupabaseClient();

	const [
		walletResponse,
		formResponse,
		swapResponse,
		paymentResponse,
		uploadResponse,
		sessionResponse,
	] = await Promise.all([
		supabase
			.from("wallet_events")
			.select("wallet_address,event_type,chain_id,occurred_at,message,context")
			.gte("occurred_at", since),
		supabase
			.from("form_events")
			.select("status,step,occurred_at,session_id,submission_id,context")
			.gte("occurred_at", since),
		supabase
			.from("lifi_swap_events")
			.select("event_type,duration_ms,occurred_at,from_chain_id,to_chain_id,from_token,to_token,amount_in,amount_out,error_label,session_id")
			.gte("occurred_at", since),
		supabase
			.from("payment_flow_events")
			.select("status,session_id,hypercert_id,context,step_name,step_index,tx_hash,order_id,occurred_at")
			.gte("occurred_at", since),
		supabase
			.from("ipfs_upload_logs")
			.select("status,size_bytes,occurred_at,session_id")
			.gte("occurred_at", since),
		supabase
			.from("telemetry_sessions")
			.select("id,wallet_address,created_at,last_seen,referrer,user_agent")
			.gte("created_at", since),
	]);

	const walletEvents =
		(walletResponse.data as Tables<"wallet_events">[]) ?? [];
	const formEvents = (formResponse.data as Tables<"form_events">[]) ?? [];
	const swapEvents =
		(swapResponse.data as Tables<"lifi_swap_events">[]) ?? [];
	const paymentEvents =
		(paymentResponse.data as Tables<"payment_flow_events">[]) ?? [];
	const uploadEvents =
		(uploadResponse.data as Tables<"ipfs_upload_logs">[]) ?? [];
	const sessions =
		(sessionResponse.data as Tables<"telemetry_sessions">[]) ?? [];

	if (walletResponse.error) {
		console.warn("Failed to fetch wallet events", walletResponse.error);
	}
	if (formResponse.error) {
		console.warn("Failed to fetch form events", formResponse.error);
	}
	if (swapResponse.error) {
		console.warn("Failed to fetch swap events", swapResponse.error);
	}
	if (paymentResponse.error) {
		console.warn("Failed to fetch payment events", paymentResponse.error);
	}
	if (uploadResponse.error) {
		console.warn("Failed to fetch upload events", uploadResponse.error);
	}
	if (sessionResponse.error) {
		console.warn("Failed to fetch sessions", sessionResponse.error);
	}

	// Wallets
	const walletConnects = walletEvents.filter(
		(event) => event.event_type === "connect",
	);
	const uniqueWallets = new Set(
		walletConnects
			.map((event) => event.wallet_address?.toLowerCase())
			.filter(Boolean) as string[],
	).size;
	const chainSwitches = walletEvents.filter(
		(event) => event.event_type === "chain_switch",
	).length;

	// Forms
	const formStarts = formEvents.filter(
		(event) => event.status === "started" && event.step === "hypercert_form",
	).length;
	const formCompletions = formEvents.filter(
		(event) => event.status === "completed" && event.step === "hypercert_form",
	).length;
	const formErrors = formEvents.filter(
		(event) => event.status === "error",
	).length;

	// Li.Fi widget
	const swapStarts = swapEvents.filter(
		(event) => event.event_type === "route_started",
	).length;
	const swapCompletions = swapEvents.filter(
		(event) => event.event_type === "route_completed",
	).length;
	const swapDurations = swapEvents
		.filter(
			(event) => event.event_type === "route_completed" && event.duration_ms,
		)
		.map((event) => event.duration_ms ?? 0);

	// Payment flows
	const flows = new Map<
		string,
		{ completed: boolean; errored: boolean }
	>();
	for (const event of paymentEvents) {
		const fallbackId = `${event.session_id}-${event.hypercert_id}`;
		const flowId = extractFlowId(event.context, fallbackId);
		const existing =
			flows.get(flowId) ?? { completed: false, errored: false };
		if (event.status === "completed" && event.step_name === "Order completed") {
			existing.completed = true;
		}
		if (event.status === "error") {
			existing.errored = true;
		}
		flows.set(flowId, existing);
	}
	const totalFlows = flows.size;
	const completedFlows = Array.from(flows.values()).filter(
		(flow) => flow.completed,
	).length;
	const erroredFlows = Array.from(flows.values()).filter(
		(flow) => flow.errored,
	).length;

	// IPFS uploads
	const uploadSuccess = uploadEvents.filter(
		(event) => event.status === "success",
	).length;
	const uploadFailures = uploadEvents.filter(
		(event) => event.status === "error",
	).length;

	// PERFORMANCE METRICS
	const submissionTimings = new Map<string, { start: Date; end?: Date; steps: Array<{ step: string; time: number }> }>();
	for (const event of formEvents.filter((e) => e.submission_id)) {
		const sid = event.submission_id!;
		if (!submissionTimings.has(sid)) {
			submissionTimings.set(sid, { start: new Date(event.occurred_at), steps: [] });
		}
		const timing = submissionTimings.get(sid)!;
		if (event.step === "mint_completed" && event.status === "completed") {
			timing.end = new Date(event.occurred_at);
		}
	}
	const mintTimes = Array.from(submissionTimings.values())
		.filter((t) => t.end)
		.map((t) => (t.end!.getTime() - t.start.getTime()) / 1000);
	const averageMintTimeSeconds = mintTimes.length > 0 ? mintTimes.reduce((a, b) => a + b, 0) / mintTimes.length : 0;

	// Calculate step durations
	const stepDurations = new Map<string, number[]>();
	const sortedForms = formEvents
		.filter((e) => e.submission_id && e.status === "in_progress")
		.sort((a, b) => new Date(a.occurred_at).getTime() - new Date(b.occurred_at).getTime());
	for (let i = 0; i < sortedForms.length - 1; i++) {
		const current = sortedForms[i];
		const next = sortedForms[i + 1];
		if (current.submission_id === next.submission_id) {
			const duration = new Date(next.occurred_at).getTime() - new Date(current.occurred_at).getTime();
			if (!stepDurations.has(current.step)) stepDurations.set(current.step, []);
			stepDurations.get(current.step)!.push(duration);
		}
	}
	const slowestSteps = Array.from(stepDurations.entries())
		.map(([step, durations]) => ({
			step,
			avgDurationMs: Math.round(durations.reduce((a, b) => a + b, 0) / durations.length),
		}))
		.sort((a, b) => b.avgDurationMs - a.avgDurationMs)
		.slice(0, 5);

	// Payment timings
	const paymentTimings = new Map<string, { start: Date; approval?: Date; confirmation?: Date; end?: Date }>();
	for (const event of paymentEvents) {
		const flowId = extractFlowId(event.context, `${event.session_id}-${event.order_id}`);
		if (!paymentTimings.has(flowId)) {
			paymentTimings.set(flowId, { start: new Date(event.occurred_at) });
		}
		const timing = paymentTimings.get(flowId)!;
		if (event.step_index === 2 && event.status === "completed") timing.approval = new Date(event.occurred_at);
		if (event.step_index === 5 && event.status === "completed") timing.confirmation = new Date(event.occurred_at);
		if (event.step_name === "Order completed" && event.status === "completed") timing.end = new Date(event.occurred_at);
	}
	const completedPayments = Array.from(paymentTimings.values()).filter((t) => t.end);
	const averagePaymentTimeSeconds = completedPayments.length > 0
		? completedPayments.reduce((sum, t) => sum + (t.end!.getTime() - t.start.getTime()), 0) / completedPayments.length / 1000
		: 0;
	const approvalTimes = completedPayments.filter((t) => t.approval).map((t) => (t.approval!.getTime() - t.start.getTime()) / 1000);
	const approvalTimeSeconds = approvalTimes.length > 0 ? approvalTimes.reduce((a, b) => a + b, 0) / approvalTimes.length : 0;
	const confirmationTimes = completedPayments.filter((t) => t.confirmation && t.approval).map((t) => (t.confirmation!.getTime() - t.approval!.getTime()) / 1000);
	const confirmationTimeSeconds = confirmationTimes.length > 0 ? confirmationTimes.reduce((a, b) => a + b, 0) / confirmationTimes.length : 0;

	// Upload performance
	const uploadSizes = uploadEvents.filter((e) => e.size_bytes).map((e) => e.size_bytes! / 1024);
	const averageUploadSizeKB = uploadSizes.length > 0 ? uploadSizes.reduce((a, b) => a + b, 0) / uploadSizes.length : 0;

	const uploadTimings = new Map<string, { start: Date; end?: Date }>();
	for (const event of uploadEvents) {
		const sid = event.session_id || "unknown";
		if (!uploadTimings.has(sid)) {
			uploadTimings.set(sid, { start: new Date(event.occurred_at) });
		}
		if (event.status === "success") {
			uploadTimings.get(sid)!.end = new Date(event.occurred_at);
		}
	}
	const uploadDurations = Array.from(uploadTimings.values())
		.filter((t) => t.end)
		.map((t) => t.end!.getTime() - t.start.getTime());
	const averageUploadTimeMs = uploadDurations.length > 0 ? uploadDurations.reduce((a, b) => a + b, 0) / uploadDurations.length : 0;

	// BEHAVIOR METRICS
	const eventsPerSession = new Map<string, number>();
	for (const event of [...walletEvents.map((e) => e.session_id), ...formEvents.map((e) => e.session_id), ...swapEvents.map((e) => e.session_id)]) {
		eventsPerSession.set(event, (eventsPerSession.get(event) || 0) + 1);
	}
	const eventCounts = Array.from(eventsPerSession.values());
	const averageEventsPerSession = eventCounts.length > 0 ? eventCounts.reduce((a, b) => a + b, 0) / eventCounts.length : 0;
	const bounceRate = safeDivision(eventCounts.filter((count) => count < 2).length, Math.max(eventCounts.length, 1));

	const walletsByChain = new Map<string, Set<number>>();
	for (const event of walletEvents.filter((e) => e.wallet_address && e.chain_id)) {
		const addr = event.wallet_address!.toLowerCase();
		if (!walletsByChain.has(addr)) walletsByChain.set(addr, new Set());
		walletsByChain.get(addr)!.add(event.chain_id!);
	}
	const multiChainUsers = Array.from(walletsByChain.values()).filter((chains) => chains.size > 1).length;

	const disconnects = walletEvents.filter((e) => e.event_type === "disconnect").length;
	const walletDisconnectRate = safeDivision(disconnects, Math.max(walletConnects.length, 1));

	const walletFirstSeen = new Map<string, Date>();
	for (const session of sessions.filter((s) => s.wallet_address)) {
		const addr = session.wallet_address!.toLowerCase();
		const date = new Date(session.created_at);
		if (!walletFirstSeen.has(addr) || date < walletFirstSeen.get(addr)!) {
			walletFirstSeen.set(addr, date);
		}
	}
	const cutoff = new Date(since);
	const returningUsers = Array.from(walletFirstSeen.values()).filter((date) => date < cutoff).length;
	const newUsers = uniqueWallets - returningUsers;
	const retentionRate = safeDivision(returningUsers, Math.max(uniqueWallets, 1));

	const tipEvents = paymentEvents.filter((e) => e.step_index === 6);
	const tipAccepted = tipEvents.filter((e) => e.status === "completed" && e.tx_hash).length;
	const tipDeclined = tipEvents.filter((e) => e.status === "completed" && !e.tx_hash).length;
	const tipAcceptanceRate = safeDivision(tipAccepted, Math.max(tipAccepted + tipDeclined, 1));
	const tipDeclineRate = safeDivision(tipDeclined, Math.max(tipAccepted + tipDeclined, 1));

	// SWAP INTELLIGENCE
	const chainPairCounts = new Map<string, number>();
	const tokenPairData = new Map<string, { count: number; totalAmount: number }>();
	for (const event of swapEvents) {
		if (event.from_chain_id && event.to_chain_id) {
			const key = `${event.from_chain_id}-${event.to_chain_id}`;
			chainPairCounts.set(key, (chainPairCounts.get(key) || 0) + 1);
		}
		if (event.from_token && event.to_token) {
			const key = `${event.from_token}-${event.to_token}`;
			if (!tokenPairData.has(key)) tokenPairData.set(key, { count: 0, totalAmount: 0 });
			const data = tokenPairData.get(key)!;
			data.count++;
			data.totalAmount += event.amount_in || 0;
		}
	}

	const sortedChainPairs = Array.from(chainPairCounts.entries()).sort((a, b) => b[1] - a[1]);
	const mostUsedPair = sortedChainPairs[0];
	const mostUsedSourceChain = mostUsedPair ? mostUsedPair[0].split("-")[0] : null;
	const mostUsedDestChain = mostUsedPair ? mostUsedPair[0].split("-")[1] : null;

	const chainPairDistribution = sortedChainPairs.slice(0, 10).map(([pair, count]) => {
		const [from, to] = pair.split("-");
		return { from: Number(from), to: Number(to), count };
	});

	const popularTokenPairs = Array.from(tokenPairData.entries())
		.sort((a, b) => b[1].count - a[1].count)
		.slice(0, 10)
		.map(([pair, data]) => {
			const [fromToken, toToken] = pair.split("-");
			return {
				fromToken,
				toToken,
				count: data.count,
				avgAmountUSD: data.count > 0 ? Number((data.totalAmount / data.count).toFixed(2)) : 0,
			};
		});

	const swapAmounts = swapEvents.filter((e) => e.amount_in).map((e) => e.amount_in!);
	const averageSwapAmountUSD = swapAmounts.length > 0 ? Number((swapAmounts.reduce((a, b) => a + b, 0) / swapAmounts.length).toFixed(2)) : 0;
	const totalSwapVolumeUSD = Number(swapAmounts.reduce((a, b) => a + b, 0).toFixed(2));

	const swapFailures = swapEvents.filter((e) => e.event_type === "route_failed").length;
	const swapFailureRate = safeDivision(swapFailures, Math.max(swapStarts, 1));

	const failureReasons = new Map<string, number>();
	for (const event of swapEvents.filter((e) => e.event_type === "route_failed" && e.error_label)) {
		const reason = event.error_label!;
		failureReasons.set(reason, (failureReasons.get(reason) || 0) + 1);
	}
	const commonFailureReasons = Array.from(failureReasons.entries())
		.sort((a, b) => b[1] - a[1])
		.slice(0, 5)
		.map(([reason]) => reason);

	// ONCHAIN METRICS
	const approvalTxCount = paymentEvents.filter((e) => e.step_index === 2 && e.tx_hash).length;
	const purchaseTxCount = paymentEvents.filter((e) => e.step_index === 4 && e.tx_hash).length;
	const tipTxCount = paymentEvents.filter((e) => e.step_index === 6 && e.tx_hash).length;
	const uniqueHypercertsFromPayments = new Set(paymentEvents.map((e) => e.hypercert_id)).size;
	const uniqueOrdersCompleted = new Set(
		paymentEvents.filter((e) => e.status === "completed" && e.step_name === "Order completed").map((e) => e.order_id),
	).size;
	const platformFeesCollected = tipTxCount;

	// ERROR ANALYTICS
	const validationErrors = formEvents.filter((e) => e.status === "error" && e.context);
	const validationErrorCounts = new Map<string, { message: string; count: number }>();
	for (const event of validationErrors) {
		const ctx = event.context as { message?: string } | null;
		if (ctx && ctx.message) {
			const key = `${event.step}:${ctx.message}`;
			if (!validationErrorCounts.has(key)) {
				validationErrorCounts.set(key, { message: ctx.message, count: 0 });
			}
			validationErrorCounts.get(key)!.count++;
		}
	}
	const topValidationErrors = Array.from(validationErrorCounts.entries())
		.map(([key, data]) => ({ field: key.split(":")[0], message: data.message, count: data.count }))
		.sort((a, b) => b.count - a.count)
		.slice(0, 10);

	const connectionErrors = walletEvents.filter((e) => e.event_type === "error" && e.message).length;
	const chainSwitchErrors = 0;

	const stepErrors = new Map<string, number>();
	const stepTotals = new Map<string, number>();
	for (const event of paymentEvents) {
		stepTotals.set(event.step_name, (stepTotals.get(event.step_name) || 0) + 1);
		if (event.status === "error") {
			stepErrors.set(event.step_name, (stepErrors.get(event.step_name) || 0) + 1);
		}
	}
	const errorsByStep = Array.from(stepErrors.entries())
		.map(([step, errorCount]) => ({
			step,
			errorCount,
			errorRate: safeDivision(errorCount, Math.max(stepTotals.get(step) || 1, 1)),
		}))
		.sort((a, b) => b.errorRate - a.errorRate);

	const uploadErrorRate = safeDivision(uploadFailures, Math.max(uploadEvents.length, 1));
	const largeFileFailures = uploadEvents.filter((e) => e.status === "error" && e.size_bytes && e.size_bytes > 10 * 1024 * 1024).length;

	// TIME-BASED PATTERNS
	const eventsByHour = new Map<number, number>();
	const eventsByDay = new Map<string, number>();
	const allEvents = [...walletEvents.map((e) => e.occurred_at), ...formEvents.map((e) => e.occurred_at), ...swapEvents.map((e) => e.occurred_at)];
	let weekdayEvents = 0;
	let weekendEvents = 0;
	for (const timestamp of allEvents) {
		const date = new Date(timestamp);
		const hour = date.getUTCHours();
		const dayName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][date.getUTCDay()];
		eventsByHour.set(hour, (eventsByHour.get(hour) || 0) + 1);
		eventsByDay.set(dayName, (eventsByDay.get(dayName) || 0) + 1);
		if (date.getUTCDay() === 0 || date.getUTCDay() === 6) {
			weekendEvents++;
		} else {
			weekdayEvents++;
		}
	}
	const peakHour = Array.from(eventsByHour.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || 0;
	const peakDay = Array.from(eventsByDay.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || "Unknown";

	const dailyActiveWallets = new Set(
		sessions.filter((s) => s.wallet_address && new Date(s.created_at) >= dayAgo).map((s) => s.wallet_address!.toLowerCase()),
	).size;
	const weeklyActiveWallets = new Set(
		sessions.filter((s) => s.wallet_address && new Date(s.created_at) >= weekAgo).map((s) => s.wallet_address!.toLowerCase()),
	).size;

	// GEOGRAPHIC INSIGHTS
	const referrerCounts = new Map<string, { count: number; conversions: number }>();
	for (const session of sessions) {
		if (session.referrer) {
			if (!referrerCounts.has(session.referrer)) {
				referrerCounts.set(session.referrer, { count: 0, conversions: 0 });
			}
			const data = referrerCounts.get(session.referrer)!;
			data.count++;
			// Check if session converted (minted or purchased)
			const hasMint = formEvents.some((e) => e.session_id === session.id && e.step === "mint_completed");
			const hasPurchase = paymentEvents.some((e) => e.session_id === session.id && e.step_name === "Order completed");
			if (hasMint || hasPurchase) data.conversions++;
		}
	}
	const topReferrers = Array.from(referrerCounts.entries())
		.map(([referrer, data]) => ({
			referrer,
			count: data.count,
			conversionRate: safeDivision(data.conversions, Math.max(data.count, 1)),
		}))
		.sort((a, b) => b.count - a.count)
		.slice(0, 10);

	const userAgentCounts = new Map<string, number>();
	for (const session of sessions.filter((s) => s.user_agent)) {
		const ua = session.user_agent!;
		const browser = ua.includes("Chrome") ? "Chrome" : ua.includes("Firefox") ? "Firefox" : ua.includes("Safari") ? "Safari" : "Other";
		userAgentCounts.set(browser, (userAgentCounts.get(browser) || 0) + 1);
	}
	const topUserAgents = Array.from(userAgentCounts.entries())
		.map(([browser, count]) => ({ browser, count }))
		.sort((a, b) => b.count - a.count)
		.slice(0, 5);

	return {
		lastUpdated: new Date().toISOString(),
		wallets: {
			monthlyActive: uniqueWallets,
			totalConnects: walletConnects.length,
			chainSwitches,
		},
		forms: {
			started: formStarts,
			completed: formCompletions,
			completionRate: safeDivision(formCompletions, Math.max(formStarts, 1)),
			validationErrors: formErrors,
		},
		swaps: {
			started: swapStarts,
			completed: swapCompletions,
			completionRate: safeDivision(swapCompletions, Math.max(swapStarts, 1)),
			medianDurationMs: median(swapDurations),
			mostUsedSourceChain,
			mostUsedDestChain,
			chainPairDistribution,
			popularTokenPairs,
			averageSwapAmountUSD,
			totalSwapVolumeUSD,
			failureRate: swapFailureRate,
			commonFailureReasons,
		},
		payments: {
			totalFlows,
			completedFlows,
			completionRate: safeDivision(completedFlows, Math.max(totalFlows, 1)),
			dropOffRate: safeDivision(erroredFlows, Math.max(totalFlows, 1)),
		},
		uploads: {
			total: uploadEvents.length,
			failures: uploadFailures,
			successRate: safeDivision(uploadSuccess, Math.max(uploadEvents.length, 1)),
		},
		performance: {
			averageMintTimeSeconds: Number(averageMintTimeSeconds.toFixed(1)),
			slowestSteps,
			averagePaymentTimeSeconds: Number(averagePaymentTimeSeconds.toFixed(1)),
			approvalTimeSeconds: Number(approvalTimeSeconds.toFixed(1)),
			confirmationTimeSeconds: Number(confirmationTimeSeconds.toFixed(1)),
			averageUploadSizeKB: Number(averageUploadSizeKB.toFixed(1)),
			averageUploadTimeMs: Number(averageUploadTimeMs.toFixed(0)),
		},
		behavior: {
			averageEventsPerSession: Number(averageEventsPerSession.toFixed(1)),
			bounceRate,
			multiChainUsers,
			walletDisconnectRate,
			returningUsers,
			newUsers,
			retentionRate,
			tipAcceptanceRate,
			tipDeclineRate,
		},
		onchain: {
			approvalTxCount,
			purchaseTxCount,
			tipTxCount,
			uniqueHypercertsFromPayments,
			uniqueOrdersCompleted,
			platformFeesCollected,
		},
		errors: {
			topValidationErrors,
			connectionErrors,
			chainSwitchErrors,
			errorsByStep,
			uploadErrorRate,
			largeFileFailures,
		},
		patterns: {
			peakHour,
			peakDay,
			weekdayVsWeekend: {
				weekdayEvents,
				weekendEvents,
			},
			dailyActiveUsers: dailyActiveWallets,
			weeklyActiveUsers: weeklyActiveWallets,
			monthlyActiveUsers: uniqueWallets,
		},
		geo: {
			topReferrers,
			topUserAgents,
		},
	};
};
