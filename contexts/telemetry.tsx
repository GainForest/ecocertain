"use client";

import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";

import type {
	TelemetryClientEvent,
	TelemetryServerEvent,
} from "@/lib/telemetry/events";

const SESSION_STORAGE_KEY = "ecocertain.telemetry.session";

type TelemetryContextValue = {
	sessionId: string | null;
	logEvent: (event: TelemetryClientEvent) => Promise<void>;
};

const TelemetryContext = createContext<TelemetryContextValue | null>(null);

const ensureTimestamp = (timestamp?: string) => {
	if (timestamp) return timestamp;
	return new Date().toISOString();
};

const sendTelemetryEvents = async (events: TelemetryServerEvent[]) => {
	try {
		await fetch("/api/telemetry", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			keepalive: true,
			body: JSON.stringify({ events }),
		});
	} catch (error) {
		console.warn("Failed to send telemetry events", error);
	}
};

const requestSession = async (sessionId?: string) => {
	const response = await fetch("/api/telemetry/session", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ sessionId }),
	});
	if (!response.ok) {
		throw new Error("Failed to initialize telemetry session");
	}
	const data = (await response.json()) as { sessionId: string };
	return data.sessionId;
};

export const TelemetryProvider = ({
	children,
	enabled,
}: {
	children: React.ReactNode;
	enabled: boolean;
}) => {
	const [sessionId, setSessionId] = useState<string | null>(null);
	const isInitializing = useRef(false);

	useEffect(() => {
		if (typeof window === "undefined") {
			return;
		}
		if (isInitializing.current || !enabled) return;
		isInitializing.current = true;

		const initialize = async () => {
			const stored = window.localStorage.getItem(SESSION_STORAGE_KEY);
			try {
				const newSessionId = await requestSession(stored ?? undefined);
				window.localStorage.setItem(SESSION_STORAGE_KEY, newSessionId);
				setSessionId(newSessionId);
			} catch (error) {
				console.warn("Unable to initialize telemetry session", error);
			}
		};

		void initialize();
	}, [enabled]);

	const logEvent = useCallback(
		async (event: TelemetryClientEvent) => {
			if (!enabled || !sessionId) return;
			const payload: TelemetryServerEvent = {
				...event,
				sessionId,
				timestamp: ensureTimestamp(event.timestamp),
			};
			await sendTelemetryEvents([payload]);
		},
		[sessionId, enabled],
	);

	const value = useMemo<TelemetryContextValue>(
		() => ({
			sessionId,
			logEvent,
		}),
		[sessionId, logEvent],
	);

	return (
		<TelemetryContext.Provider value={value}>
			{children}
		</TelemetryContext.Provider>
	);
};

export const useTelemetry = () => {
	const context = useContext(TelemetryContext);
	if (!context) {
		throw new Error("useTelemetry must be used within TelemetryProvider");
	}
	return context;
};
