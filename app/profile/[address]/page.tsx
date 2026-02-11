import { type Address, getAddress } from "viem";

import PageError from "@/app/components/shared/PageError";

import { catchError } from "@/app/utils";
import { MotionWrapper } from "@/components/ui/motion-wrapper";
import { fetchHypercertsByUserId } from "@/graphql/hypercerts/queries/user-hypercerts";
import { notFound } from "next/navigation";

import {
	type SaleByUser,
	type SaleByUserHypercert,
	fetchSalesByUser,
} from "@/graphql/hypercerts/queries/sales";
import {
	convertCurrencyPriceToUSD,
	getValueFromSearchParams,
} from "@/lib/utils";
import Content from "./components/content";
import ProfileCard from "./components/profile-card";
import StatCard from "./components/stat-card";

export type CombinedSale = {
	totalAmountInUSD: number;
	unitsBought: bigint;
	hypercert: SaleByUserHypercert;
	id: string;
	lastSaleTimestamp: bigint;
};

const combineSales = async (sales: SaleByUser[]) => {
	const saleIndexer = new Map<string, number>();
	const combinedSales: CombinedSale[] = [];

	// Create an array of promises for all currency conversions
	const conversionPromises = sales.map(async (sale) => {
		try {
			const convertedPrice = await convertCurrencyPriceToUSD(
				sale.currency,
				sale.currencyAmount,
			);
			return convertedPrice;
		} catch (e) {
			return null;
		}
	});

	// Await all promises in parallel
	const amountsInUSD = await Promise.all(conversionPromises);

	for (let i = 0; i < sales.length; i++) {
		const sale = sales[i];
		const amountInUSD = amountsInUSD[i];

		if (amountInUSD === null) continue;

		const hypercertId = sale.hypercert.hypercertId;
		if (!saleIndexer.has(hypercertId)) {
			saleIndexer.set(hypercertId, combinedSales.length);
			combinedSales.push({
				totalAmountInUSD: amountInUSD,
				unitsBought: sale.unitsBought,
				hypercert: sale.hypercert,
				id: sale.id,
				lastSaleTimestamp: sale.saleTimestamp,
			});
			continue;
		}

		const index = saleIndexer.get(hypercertId);
		if (index === undefined) continue; // This will never happen.
		combinedSales[index].totalAmountInUSD += amountInUSD;
		combinedSales[index].unitsBought += sale.unitsBought;
		combinedSales[index].lastSaleTimestamp = BigInt(
			Math.max(
				Number(combinedSales[index].lastSaleTimestamp),
				Number(sale.saleTimestamp),
			),
		);
	}

	return combinedSales;
};

export default async function ProfilePage({
	params,
	searchParams,
}: {
	params: Promise<{ address: Address }>;
	searchParams: Promise<{ view: string | string[] | undefined }>;
}) {
	const { address } = await params;

	// Early validation: reject non-hex-address paths before any heavy lifting.
	// This turns bot-crawled garbage URLs (e.g. "/profile/god") into instant 404s
	// instead of burning serverless compute on viem parsing + GraphQL queries.
	if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
		notFound();
	}

	let formattedAddress: `0x${string}`;
	try {
		formattedAddress = getAddress(address) as `0x${string}`;
	} catch {
		notFound();
	}
	const view = getValueFromSearchParams(
		await searchParams,
		"view",
		"supported",
		["created", "supported"],
	);
	// const DUMMY_ADDRESS = "0x223c656ed35bfb7a8e358140ca1e2077be090b2e";

	// Remove the catchError wrapper and let errors propagate
	const sales = await fetchSalesByUser(formattedAddress);
	const userHypercerts = await fetchHypercertsByUserId(formattedAddress);

	const combinedSales = await combineSales(sales ?? []);
	const totalSalesInUSD =
		Math.floor(
			combinedSales.reduce((acc, sale) => {
				return acc + sale.totalAmountInUSD;
			}, 0) * 100,
		) / 100;

	const { hypercerts } = userHypercerts;
	const hypercertIdSet = new Set<string>();
	const validHypercerts = hypercerts.filter((hypercert) => {
		if (hypercert.hypercertId === undefined) return false;
		if (hypercertIdSet.has(hypercert.hypercertId)) return false;
		if (hypercert.name === undefined) return false;
		hypercertIdSet.add(hypercert.hypercertId);
		return true;
	});
	const validHypercertsCount = validHypercerts.length;

	return (
		<MotionWrapper
			type="main"
			className="mx-auto flex max-w-6xl flex-col items-start gap-8 p-10 md:flex-row"
			initial={{ opacity: 0, filter: "blur(10px)" }}
			animate={{ opacity: 1, filter: "blur(0px)" }}
			transition={{ duration: 0.5 }}
		>
			<div className="flex w-full max-w-full flex-col gap-4 md:max-w-[300px]">
				<ProfileCard
					view={view}
					address={formattedAddress}
					stats={{
						hypercertsCreated: validHypercertsCount,
						hypercertsSupported: combinedSales.length,
						salesMadeCount: sales.length,
					}}
				/>
				<StatCard
					title={"Hypercerts supported"}
					display={combinedSales.length}
				/>
				<StatCard
					title={"Total amount contributed"}
					display={
						<>
							{totalSalesInUSD}
							<span className="text-xl">&nbsp;USD</span>
						</>
					}
				/>
			</div>
			<Content
				view={view}
				createdHypercerts={hypercerts}
				combinedSales={combinedSales}
			/>
		</MotionWrapper>
	);
}
