import { formatTokens } from "@/lib/format-tokens";
import React, { useEffect, useState } from "react";
import { erc20Abi } from "viem";
import { useReadContract } from "wagmi";
import useAccount from "@/hooks/use-account";

export type UserFunds = {
  data: {
    raw: bigint | undefined;
    formatted: string | undefined;
  };
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
};

// Add decimals parameter to the hook
const useUserFunds = (tokenAddress: `0x${string}`): UserFunds => {
  const { address } = useAccount();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const {
    data: decimals, // renamed to rawBalance since it's the big number
  } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "decimals",
  });

  const {
    data: rawBalance, // renamed to rawBalance since it's the big number
    refetch: wagmiRefetch,
    error: wagmiError,
    isLoading: wagmiIsLoading,
  } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : ["0x0"],
  });

  // Format the balance with proper decimals
  const formattedBalance =
    rawBalance !== undefined && decimals !== undefined
      ? formatTokens(rawBalance, decimals, 2)
      : undefined;

  // Rest of the hook implementation stays the same
  // biome-ignore lint/correctness/useExhaustiveDependencies(wagmiRefetch, setIsLoading): We don't want the useEffect block to run when these two functions change.
  useEffect(() => {
    setIsLoading(true);
    wagmiRefetch().finally(() => setIsLoading(false));
  }, [tokenAddress, address]);

  const refetch = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await wagmiRefetch();
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (wagmiError) {
      setError(wagmiError);
    }
  }, [wagmiError]);

  return {
    data: {
      raw: rawBalance, // bigint (e.g., 1932000n)
      formatted: formattedBalance, // string (e.g., "1.932")
    },
    isLoading: isLoading || wagmiIsLoading,
    error,
    refetch,
  };
};

export default useUserFunds;
