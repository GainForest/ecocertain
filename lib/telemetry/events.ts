export type TelemetryBaseEvent = {
	context?: Record<string, unknown>;
	timestamp?: string;
};

export type WalletTelemetryEvent = TelemetryBaseEvent & {
	type: "wallet";
	event: "connect" | "disconnect" | "chain_switch" | "error";
	walletAddress?: string;
	chainId?: number;
	connector?: string;
	message?: string;
};

export type FormTelemetryEvent = TelemetryBaseEvent & {
	type: "form";
	submissionId?: string;
	step: string;
	status: "started" | "in_progress" | "completed" | "error";
	hypercertId?: string;
};

export type LifiSwapTelemetryEvent = TelemetryBaseEvent & {
	type: "lifi_swap";
	hypercertId: string;
	event: "route_started" | "route_completed" | "route_failed";
	routeId?: string;
	fromChainId?: number;
	toChainId?: number;
	fromToken?: string;
	toToken?: string;
	amountIn?: number;
	amountOut?: number;
	durationMs?: number;
	errorLabel?: string;
};

export type PaymentFlowTelemetryEvent = TelemetryBaseEvent & {
	type: "payment_flow";
	hypercertId: string;
	orderId: string;
	stepIndex: number;
	stepName: string;
	status: "in_progress" | "completed" | "error";
	txHash?: string;
};

export type IpfsUploadTelemetryEvent = TelemetryBaseEvent & {
	type: "ipfs_upload";
	sessionId?: string;
	walletAddress?: string;
	fileName?: string;
	sizeBytes?: number;
	mimeType?: string;
	status: "success" | "error";
	cid?: string;
	message?: string;
};

export type TelemetryClientEvent =
	| WalletTelemetryEvent
	| FormTelemetryEvent
	| LifiSwapTelemetryEvent
	| PaymentFlowTelemetryEvent;

export type TelemetryServerEvent =
	TelemetryClientEvent & {
		sessionId: string;
		timestamp: string;
	};

export type TelemetryRequestPayload = {
	events: TelemetryServerEvent[];
};
