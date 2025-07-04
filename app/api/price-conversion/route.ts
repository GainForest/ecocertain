import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const id = searchParams.get("id");
	const amount = searchParams.get("amount") || "1";
	const convert_id = searchParams.get("convert_id") || "2781";

	if (!id) {
		return NextResponse.json(
			{ error: "Missing id parameter" },
			{ status: 400 },
		);
	}

	const apiUrl = `https://api.coinmarketcap.com/data-api/v3/tools/price-conversion?amount=${encodeURIComponent(
		amount,
	)}&convert_id=${encodeURIComponent(convert_id)}&id=${encodeURIComponent(id)}`;

	try {
		const response = await fetch(apiUrl);
		const data = await response.json();
		return NextResponse.json(data);
	} catch (error) {
		return NextResponse.json(
			{ error: "Failed to fetch price data", details: String(error) },
			{ status: 500 },
		);
	}
}
