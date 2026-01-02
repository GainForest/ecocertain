import { cn } from "@/lib/utils";
import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

import { Analytics } from "@vercel/analytics/react";

import GdprBanner from "@/components/GdprBanner";
import HypercertExchangeClientProvider from "@/components/providers/HypercertExchangeClientProvider";
import TelemetryConsentGate from "@/components/telemetry/TelemetryConsentGate";
import { ModalProvider } from "@/components/ui/modal/context";
import { Toaster } from "@/components/ui/sonner";
import { siteConfig } from "@/config/site";
import { config } from "@/config/wagmi";
import { ConsentProvider } from "@/contexts/consent";
import { WagmiContextProvider } from "@/contexts/wagmi";
import { Libre_Baskerville } from "next/font/google";
import { cookies } from "next/headers";
import { PriceFeedProvider } from "./PriceFeedProvider";
import FarcasterProvider from "./components/FarcasterProvider";
import Footer from "./components/Footer";
import Header from "./components/Header";

const baskerville = Libre_Baskerville({
	variable: "--font-baskerville",
	subsets: ["latin"],
	weight: ["400", "700"],
});

const archia = localFont({
	src: [
		{
			path: "./fonts/Archia/Regular.otf",
			weight: "400",
			style: "regular",
		},
	],
	variable: "--font-archia",
});

export const metadata: Metadata = {
	metadataBase: new URL(siteConfig.url),
	title: siteConfig.name,
	description: siteConfig.description,
	authors: [{ name: "GainForest", url: "https://gainforest.earth" }],
	icons: [
		{
			rel: "icon",
			url: "/favicon.ico",
		},
		{
			rel: "icon",
			url: "/favicon-dark.ico",
			media: "(prefers-color-scheme: dark)",
		},
	],
	alternates: {
		canonical: "./",
	},
	robots: {
		index: true,
		follow: true,
	},

	applicationName: siteConfig.name,
	keywords: [
		"hypercerts",
		"ecocerts",
		"ecocertain",
		"fund",
		"impactful",
		"regenerative",
		"projects",
		"forest",
		"conservation",
		"deforestation",
		"gainforest",
		"earth",
		"green",
	],
	generator: "Next.js",
	creator: "GainForest",
	publisher: "GainForest",
	referrer: "origin",
	formatDetection: {
		email: false,
		address: false,
		telephone: false,
	},
	openGraph: {
		title: siteConfig.name,
		siteName: siteConfig.name,
		description: siteConfig.description,
		type: "website",
		url: siteConfig.url,
		images: [{ url: "/opengraph-image.png", alt: siteConfig.name }],
	},
	twitter: {
		card: "summary_large_image",
		site: "@GainForestNow",
		title: siteConfig.name,
		description: siteConfig.description,
		images: [{ url: "/opengraph-image.png", alt: siteConfig.name }],
	},
};

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	maximumScale: 1,
	userScalable: false,
};

const frame = {
	version: "next",
	imageUrl: "https://ecocertain.xyz/farcaster/FarcasterEmbedThumbnail.png",
	button: {
		title: "Browse Ecocerts",
		action: {
			type: "launch_frame",
			url: "https://ecocertain.xyz",
			name: siteConfig.name,
		},
	},
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const cookieStore = await cookies();
	const consentCookie = cookieStore.get("gdpr_consent")?.value === "true";
	return (
		<html lang="en">
			<head>
				<meta property="fc:frame" content={JSON.stringify(frame)} />
			</head>
			<body
				className={cn(
					"flex min-h-screen flex-col antialiased",
					baskerville.variable,
					archia.variable,
				)}
			>
				<ConsentProvider initialConsent={consentCookie}>
					<FarcasterProvider>
						<Analytics />
						<WagmiContextProvider>
							<TelemetryConsentGate>
								<HypercertExchangeClientProvider>
									<PriceFeedProvider>
										<ModalProvider modalVariants={[]}>
											<Header />
											<div className="flex-1">{children}</div>
											<Footer />
											<Toaster />
										</ModalProvider>
									</PriceFeedProvider>
								</HypercertExchangeClientProvider>
							</TelemetryConsentGate>
						</WagmiContextProvider>
					</FarcasterProvider>
					<GdprBanner />
				</ConsentProvider>
			</body>
		</html>
	);
}
