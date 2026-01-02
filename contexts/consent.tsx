"use client";

import { createContext, useContext, useMemo, useState } from "react";

type ConsentContextValue = {
	hasConsented: boolean;
	accept: () => void;
};

const ConsentContext = createContext<ConsentContextValue | undefined>(undefined);

const CONSENT_COOKIE = "gdpr_consent";
const CONSENT_STORAGE_KEY = "ecocertain.gdprConsent";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

const persistConsent = () => {
	if (typeof document !== "undefined") {
		document.cookie = `${CONSENT_COOKIE}=true; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
	}
	if (typeof window !== "undefined") {
		window.localStorage.setItem(CONSENT_STORAGE_KEY, "true");
	}
};

export const ConsentProvider = ({
	initialConsent,
	children,
}: {
	initialConsent: boolean;
	children: React.ReactNode;
}) => {
	const [hasConsented, setHasConsented] = useState(initialConsent);

	const accept = () => {
		setHasConsented(true);
		persistConsent();
	};

	const value = useMemo<ConsentContextValue>(
		() => ({
			hasConsented,
			accept,
		}),
		[hasConsented],
	);

	return (
		<ConsentContext.Provider value={value}>
			{children}
		</ConsentContext.Provider>
	);
};

export const useGDPRConsent = () => {
	const context = useContext(ConsentContext);
	if (!context) {
		throw new Error("useGDPRConsent must be used within ConsentProvider");
	}
	return context;
};
