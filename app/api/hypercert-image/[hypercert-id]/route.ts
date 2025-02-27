import { type NextRequest, NextResponse } from "next/server";
import { getHypercertImage } from "./get-hypercert-image";

// The following line adds caching to this route handler
export const dynamic = "force-static";
// The following line revalidates the cache every 1800 seconds, i.e. 30 minutes
export const revalidate = 1800;

// GET handler to fetch and return the image associated with the given hypercert ID
export async function GET(
	request: NextRequest,
	{ params }: { params: { "hypercert-id": string } },
) {
	const hypercertId = params["hypercert-id"];

	// Validate hypercert ID
	if (!hypercertId || Array.isArray(hypercertId)) {
		return new Response("Invalid ID", { status: 400 });
	}

	try {
		const { contentType, buffer } = await getHypercertImage(hypercertId);
		return new NextResponse(buffer, {
			status: 200,
			headers: {
				"Content-Type": contentType,
				"Cache-Control": "s-maxage=1800", // 30 minutes cache
			},
		});
	} catch (error) {
		return new Response("Error fetching image", { status: 500 });
	}
}
