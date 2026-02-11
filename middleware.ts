import { type NextRequest, NextResponse } from "next/server";

/**
 * Blocked AI crawler User-Agent substrings.
 * These bots are blocked at the edge to prevent them from consuming
 * serverless function invocations and compute time.
 *
 * robots.txt provides an advisory signal; this middleware enforces it.
 *
 * NOTE: We intentionally match specific bot names rather than a generic
 * "bot" substring check, because that would block legitimate crawlers
 * like Googlebot and Bingbot that we want indexing the site.
 */
const BLOCKED_BOTS = [
	"GPTBot",
	"ChatGPT-User",
	"ClaudeBot",
	"CCBot",
	"PetalBot",
	"Amazonbot",
	"Bytespider",
	"Applebot-Extended",
	"Google-Extended",
];

const VALID_ETH_ADDRESS = /^0x[a-fA-F0-9]{40}$/;

export function middleware(request: NextRequest) {
	const ua = request.headers.get("user-agent") ?? "";

	// Layer 1: Block any user agent containing "bot" (case-insensitive)
	const uaLower = ua.toLowerCase();
	if (uaLower.includes("bot")) {
		return new NextResponse(JSON.stringify({ error: "Forbidden" }), {
			status: 403,
			headers: { "Content-Type": "application/json" },
		});
	}

	// Layer 2: Block known AI crawlers on any matched route
	const isBlockedBot = BLOCKED_BOTS.some((bot) => ua.includes(bot));
	if (isBlockedBot) {
		return new NextResponse(JSON.stringify({ error: "Forbidden" }), {
			status: 403,
			headers: { "Content-Type": "application/json" },
		});
	}

	// Layer 2: Validate Ethereum address format on /profile routes.
	// Reject non-hex-address paths (e.g. "/profile/god", "/profile/kiriba group")
	// at the edge before they hit a serverless function.
	const pathname = request.nextUrl.pathname;
	if (pathname.startsWith("/profile/")) {
		const address = decodeURIComponent(pathname.split("/")[2] ?? "");
		if (address && !VALID_ETH_ADDRESS.test(address)) {
			return new NextResponse(null, { status: 404 });
		}
	}

	return NextResponse.next();
}

export const config = {
	// Run on all dynamic page routes — bot blocking applies to all,
	// address validation applies only to /profile/* paths within the handler.
	matcher: [
		/*
		 * Match all request paths except:
		 * - _next/static (static files)
		 * - _next/image (image optimization)
		 * - favicon.ico, sitemap.xml, robots.txt (static meta files)
		 * - Public folder assets
		 */
		"/((?!_next/static|_next/image|favicon|sitemap|robots\\.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
	],
};
