import { Chain, createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";

async function checkMultisigWallet(chain: Chain, address: `0x${string}`) {
  const client = createPublicClient({
    chain,
    transport: http(),
  });
  try {
    const owners = await client.readContract({
      address,
      abi: [
        {
          constant: true,
          inputs: [],
          name: "getOwners",
          outputs: [{ name: "", type: "address[]" }],
          type: "function",
        },
      ],
      functionName: "getOwners",
    });

    if (Array.isArray(owners)) {
      // If the wallet has multiple owners, it's likely a multisig wallet
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
}

export default checkMultisigWallet;
