import axios from "axios";
import { NextResponse } from "next/server";

import { getServiceSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
	console.log("==================================");
	const { PINATA_API_KEY, PINATA_API_SECRET } = process.env;

	if (!PINATA_API_KEY || !PINATA_API_SECRET) {
		return NextResponse.json(
			{ error: "Pinata API credentials are missing" },
			{ status: 500 },
		);
	}

	try {
		const jsonFile = await request.json();

		if (!jsonFile) {
			return NextResponse.json(
				{ error: "JSON file is required" },
				{ status: 400 },
			);
		}

		const payload = new Blob([JSON.stringify(jsonFile)], {
			type: "application/json",
		});
		const formData = new FormData();
		formData.append("file", payload, "data.json");

		const pinataResponse = await axios.post(
			"https://api.pinata.cloud/pinning/pinFileToIPFS",
			formData,
			{
				headers: {
					"Content-Type": `multipart/form-data; boundary=${
						"_boundary" in formData ? formData._boundary : ""
					}`,
					pinata_api_key: PINATA_API_KEY,
					pinata_secret_api_key: PINATA_API_SECRET,
				},
			},
		);

		console.log(pinataResponse.data);

		const cid = pinataResponse.data.IpfsHash;
		const link = `ipfs://${cid}`;

		const supabase = getServiceSupabaseClient();
		await supabase.from("ipfs_upload_logs").insert({
			session_id: request.headers.get("x-telemetry-session"),
			wallet_address:
				request.headers.get("x-wallet-address")?.toLowerCase() ?? null,
			status: "success",
			cid,
			size_bytes: payload.size,
			mime_type: "application/json",
			occurred_at: new Date().toISOString(),
		});

		return NextResponse.json({ cid, link }, { status: 200 });
	} catch (error) {
		console.error("Error uploading file to Pinata:", error);
		try {
			const supabase = getServiceSupabaseClient();
			await supabase.from("ipfs_upload_logs").insert({
				session_id: request.headers.get("x-telemetry-session"),
				wallet_address:
					request.headers.get("x-wallet-address")?.toLowerCase() ?? null,
				status: "error",
				message:
					error instanceof Error ? error.message : "Unknown upload failure",
				occurred_at: new Date().toISOString(),
			});
		} catch (loggingError) {
			console.warn("Failed to log IPFS upload failure", loggingError);
		}
		return NextResponse.json(
			{ error: "Failed to upload file to Pinata" },
			{ status: 500 },
		);
	}
}
