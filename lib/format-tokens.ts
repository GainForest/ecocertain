export function formatTokens(
  amount: bigint,
  decimals: number,
  displayDecimals = 2
) {
  // Convert bigint to string to avoid precision loss
  const amountStr = amount.toString();

  // Handle the case where amount has fewer digits than decimals
  const paddedAmount = amountStr.padStart(decimals + 1, "0");

  // Split into integer and fractional parts
  const integerPart = paddedAmount.slice(0, -decimals) || "0";
  const fractionalPart = paddedAmount.slice(-decimals);

  // Remove leading zeros from integer part (but keep at least one digit)
  const cleanIntegerPart = integerPart.replace(/^0+/, "") || "0";

  // Truncate fractional part to desired decimal places (don't round, just truncate)
  const truncatedFractional = fractionalPart.slice(0, displayDecimals);

  // Pad fractional part if needed
  const paddedFractional = truncatedFractional.padEnd(displayDecimals, "0");

  // Combine parts
  return `${cleanIntegerPart}.${paddedFractional}`;
}
