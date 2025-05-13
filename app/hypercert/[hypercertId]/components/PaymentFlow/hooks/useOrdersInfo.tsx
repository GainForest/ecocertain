"use client";
import type {
	FullHypercert,
	FullHypercertOrders,
} from "@/graphql/hypercerts/queries/hypercerts";

const DECIMALS = 18;
const BIGINT_MULTIPLIER = 10n ** BigInt(DECIMALS);
const MULTIPLIER = Number(BIGINT_MULTIPLIER);

export const OrderInfoConstants = {
	BIGINT_MULTIPLIER,
	MULTIPLIER,
	DECIMALS,
};

const divideBigIntsWithMultiplierPrecision = (a: bigint, b: bigint): bigint => {
	// Use multipliers for precision:
	if (b === 0n) return 0n;
	return (a * BIGINT_MULTIPLIER) / b;
};

const getOrderValueData = (
	value: bigint,
	multiplierUsed = true,
): OrderValueData => {
	const normalValue = multiplierUsed ? value / BIGINT_MULTIPLIER : value;
	return {
		precisionMultiplied: value,
		bigint: normalValue,
		number: Number(normalValue),
	};
};

type Order = FullHypercertOrders[number];

type OrderValueData = {
	precisionMultiplied: bigint;
	bigint: bigint;
	number: number;
};

type OrdersInfo = {
	id: string;
	data: Order;
	totalPrice: {
		inUSD: OrderValueData; // multiplied by 10^18 for precision
		inToken: OrderValueData; // multiplied by 10^18 for precision
	};
	totalSalePrice: {
		inUSD: OrderValueData; // multiplied by 10^18 for precision
		inToken: OrderValueData; // multiplied by 10^18 for precision
	};
	pricePerUnit: {
		inUSD: OrderValueData; // multiplied by 10^18 for precision
		inToken: OrderValueData; // multiplied by 10^18 for precision
		inWei: OrderValueData;
	};
	pricePerPercentage: {
		inUSD: OrderValueData; // multiplied by 10^18 for precision
		inToken: OrderValueData; // multiplied by 10^18 for precision
	};
	units: {
		perPercentage: OrderValueData;
		perUSD: OrderValueData; // multiplied by 10^18 for precision
		perToken: OrderValueData; // multiplied by 10^18 for precision
	};
	percentage: {
		perUnit: OrderValueData; // multiplied by 10^18 for precision
		perUSD: OrderValueData; // multiplied by 10^18 for precision
		perToken: OrderValueData; // multiplied by 10^18 for precision
	};
};

const useOrdersInfo = (hypercert: FullHypercert): OrdersInfo[] => {
	const { orders, unitsForSale, totalUnits } = hypercert;
	const percentagePerUnit = divideBigIntsWithMultiplierPrecision(
		100n,
		totalUnits,
	);
	const unitsPerPercentage = totalUnits / 100n;

	return orders.map((order) => {
		const {
			pricePerPercentInUSD,
			pricePerPercentInToken,
			price: pricePerUnitInWei,
		} = order;

		const totalPrice = {
			inUSD: getOrderValueData(
				BigInt(Math.floor(pricePerPercentInUSD * MULTIPLIER)) * 100n,
			),
			inToken: getOrderValueData(
				BigInt(Math.floor(pricePerPercentInToken * MULTIPLIER)) * 100n,
			),
		};

		const pricePerPercentage = {
			inUSD: getOrderValueData(
				BigInt(Math.floor(pricePerPercentInUSD * MULTIPLIER)),
			),
			inToken: getOrderValueData(
				BigInt(Math.floor(pricePerPercentInToken * MULTIPLIER)),
			),
		};

		const pricePerUnit = {
			inUSD: getOrderValueData(
				pricePerPercentage.inUSD.precisionMultiplied / unitsPerPercentage,
			),
			inToken: getOrderValueData(
				pricePerPercentage.inToken.precisionMultiplied / unitsPerPercentage,
			),
			inWei: getOrderValueData(pricePerUnitInWei, false),
		};

		const totalSalePrice = {
			inUSD: getOrderValueData(
				pricePerUnit.inUSD.precisionMultiplied * unitsForSale,
			),
			inToken: getOrderValueData(
				pricePerUnit.inToken.precisionMultiplied * unitsForSale,
			),
		};

		const units = {
			perPercentage: getOrderValueData(unitsPerPercentage, false),
			perUSD: getOrderValueData(
				divideBigIntsWithMultiplierPrecision(
					BIGINT_MULTIPLIER,
					pricePerUnit.inUSD.precisionMultiplied,
				),
			),
			perToken: getOrderValueData(
				divideBigIntsWithMultiplierPrecision(
					BIGINT_MULTIPLIER,
					pricePerUnit.inToken.precisionMultiplied,
				),
			),
		};

		const percentage = {
			perUnit: getOrderValueData(percentagePerUnit),
			perUSD: getOrderValueData(
				divideBigIntsWithMultiplierPrecision(
					BIGINT_MULTIPLIER,
					pricePerPercentage.inUSD.precisionMultiplied,
				),
			),
			perToken: getOrderValueData(
				divideBigIntsWithMultiplierPrecision(
					BIGINT_MULTIPLIER,
					pricePerPercentage.inToken.precisionMultiplied,
				),
			),
		};

		return {
			id: order.id,
			data: order,
			totalPrice,
			totalSalePrice,
			pricePerUnit,
			pricePerPercentage,
			units,
			percentage,
		};
	});
};

export default useOrdersInfo;
