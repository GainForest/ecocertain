import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import localFont from "next/font/local";
// TODO: Import stopped working
// import "vaul/dist/index.css";
import "./globals.css";

import { Analytics } from "@vercel/analytics/react";
import { cookieToInitialState } from "wagmi";

import { siteConfig } from "@/config/site";
import { config } from "@/config/wagmi";
import { WagmiContextProvider } from "@/contexts/wagmi";
import { Libre_Baskerville } from "next/font/google";
import { headers } from "next/headers";
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
	metadataBase: new URL("https://ecocertain.xyz/"),
	title: { default: siteConfig.name, template: "%s | GainForest.Earth" },
	description: siteConfig.description,
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
	openGraph: {
		title: { default: "Ecocertain", template: "%s | GainForest.Earth" },
		description: siteConfig.description,
		type: "website",
		images: [{ url: "/opengraph-image.png", alt: "GainForest.Earth" }],
	},
	twitter: {
		card: "summary_large_image",
		site: "@edge-esmeralda",
		title: { default: "Ecocertain", template: "%s | GainForest.Earth" },
		description: siteConfig.description,
		images: [{ url: "/opengraph-image.png", alt: "GainForest.Earth" }],
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const initialState = cookieToInitialState(config, headers().get("cookie"));
	return (
		<html lang="en">
			<body
				className={cn(
					"flex min-h-screen flex-col antialiased",
					baskerville.variable,
					archia.variable,
				)}
			>
				<Analytics />
				<WagmiContextProvider initialState={initialState}>
					<Header />
					<div className="flex-1">{children}</div>
					<Footer />
				</WagmiContextProvider>
			</body>
		</html>
	);
}
