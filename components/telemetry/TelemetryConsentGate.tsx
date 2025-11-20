"use client";

import WalletTelemetryListener from "@/components/telemetry/WalletTelemetryListener";
import { useGDPRConsent } from "@/contexts/consent";
import { TelemetryProvider } from "@/contexts/telemetry";

const TelemetryConsentGate = ({ children }: { children: React.ReactNode }) => {
	const { hasConsented } = useGDPRConsent();

	return (
		<TelemetryProvider enabled={hasConsented}>
			<WalletTelemetryListener />
			{children}
		</TelemetryProvider>
	);
};

export default TelemetryConsentGate;
