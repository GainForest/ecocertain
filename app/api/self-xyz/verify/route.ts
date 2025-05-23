import {
	SelfBackendVerifier,
	countryCodes,
	getUserIdentifier,
} from "@selfxyz/core";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
	try {
		const body = await req.json();
		const { proof, publicSignals } = body;

		if (!proof || !publicSignals) {
			return NextResponse.json(
				{ message: "Proof and publicSignals are required" },
				{ status: 400 },
			);
		}

		console.log("================================");
		console.log("Proof:", proof);
		console.log("Public Signals:", publicSignals);

		// Extract user ID from the proof
		const userId = await getUserIdentifier(publicSignals);
		console.log("Extracted userId:", userId);

		// Initialize and configure the verifier
		const selfBackendVerifier = new SelfBackendVerifier(
			"gainforest-scope",
			"https://ecocertain.xyz/api/self-xyz/verify",
		);

		// Verify the proof
		const result = await selfBackendVerifier.verify(proof, publicSignals);

		if (result.isValid) {
			// Return successful verification response
			return NextResponse.json({
				status: "success",
				result: true,
				credentialSubject: result.credentialSubject,
			});
		}
		// Return failed verification response
		return NextResponse.json(
			{
				status: "error",
				result: false,
				message: "Verification failed",
				details: result.isValidDetails,
			},
			{ status: 500 },
		);
	} catch (error) {
		console.error("Error verifying proof:", error);
		return NextResponse.json(
			{
				status: "error",
				result: false,
				message: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}
