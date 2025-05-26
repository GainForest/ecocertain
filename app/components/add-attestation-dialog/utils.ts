import { HYPERCERT_ATTESTATION_SCHEMA, getEASConfig } from "@/config/eas";
import { EAS, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import type { JsonRpcSigner } from "ethers";

type AttestationSchema = {
	referencedAttestation: string | undefined;
	chainId: string;
	contractAddress: string;
	tokenId: string;
	title: string;
	description: string;
	sourceURLs: Array<[string, string | undefined]>;
};

export const addAttestation = async (
	signer: JsonRpcSigner,
	chainId: number,
	values: AttestationSchema,
) => {
	const easConfig = getEASConfig(chainId);
	if (!easConfig) {
		throw new Error("Attestations are not supported on this chain");
	}
	const eas = new EAS(easConfig.easContractAddress);

	await eas.connect(signer);

	const {
		chainId: chainIdValue,
		contractAddress,
		tokenId,
		title,
		description,
		sourceURLs,
		referencedAttestation,
	} = values;

	const sources = sourceURLs.map((source) => {
		return JSON.stringify({
			type: "url",
			src: source[0],
			description: source[1],
		});
	});

	// Initialize SchemaEncoder with the schema string
	const schemaEncoder = new SchemaEncoder(HYPERCERT_ATTESTATION_SCHEMA);
	const encodedData = schemaEncoder.encodeData([
		{ name: "chain_id", value: chainIdValue, type: "uint256" },
		{ name: "contract_address", value: contractAddress, type: "address" },
		{ name: "token_id", value: tokenId, type: "uint256" },
		{ name: "title", value: title, type: "string" },
		{ name: "description", value: description, type: "string" },
		{ name: "sources", value: sources, type: "string[]" },
	]);

	// Signer must be an ethers-like signer.
	const tx = await eas.attest({
		schema: easConfig.schemaUID,
		data: {
			recipient: "0x0000000000000000000000000000000000000000",
			expirationTime: 0n,
			revocable: false, // Be aware that if your schema is not revocable, this MUST be false
			data: encodedData,
			refUID: referencedAttestation
				? referencedAttestation
				: "0x0000000000000000000000000000000000000000000000000000000000000000",
		},
	});

	return tx;
};
