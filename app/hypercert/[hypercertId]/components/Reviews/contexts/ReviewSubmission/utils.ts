import { type EASConfig, HYPERCERT_ATTESTATION_SCHEMA } from "@/config/eas";
import { EAS, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import type { JsonRpcSigner } from "ethers";
import type { Review } from "../../types";

export const addReview = async (
	values: {
		review: string;
		hypercertId: string;
	},
	easConfig: EASConfig,
	signer: JsonRpcSigner,
) => {
	const eas = new EAS(easConfig.easContractAddress);
	eas.connect(signer);

	const { review, hypercertId } = values;
	const hypercertIdParts = hypercertId.split("-");
	if (hypercertIdParts.length !== 3) {
		throw new Error("Invalid hypercert ID");
	}
	const [, contractAddress, tokenId] = hypercertIdParts;

	// Compile the data to attest
	const data = [
		{ name: "chain_id", value: easConfig.chainId, type: "uint256" },
		{ name: "contract_address", value: contractAddress, type: "address" },
		{ name: "token_id", value: tokenId, type: "uint256" },
		{ name: "title", value: "Review", type: "string" },
		{ name: "description", value: review, type: "string" },
		{
			name: "sources",
			value: [JSON.stringify({ type: "review" })],
			type: "string[]",
		},
	];
	console.log(data);

	// Initialize SchemaEncoder with the schema string
	const schemaEncoder = new SchemaEncoder(HYPERCERT_ATTESTATION_SCHEMA);
	const encodedData = schemaEncoder.encodeData(data);

	// Signer must be an ethers-like signer.
	const tx = await eas.attest({
		schema: easConfig.schemaUID,
		data: {
			recipient: "0x0000000000000000000000000000000000000000",
			expirationTime: 0n,
			revocable: false, // Be aware that if your schema is not revocable, this MUST be false
			data: encodedData,
			refUID:
				"0x0000000000000000000000000000000000000000000000000000000000000000",
		},
	});

	return tx;
};
