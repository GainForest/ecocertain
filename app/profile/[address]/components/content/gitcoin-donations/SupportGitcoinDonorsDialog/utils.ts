import type { GitcoinEcocert } from "../hooks/use-gitcoin-ecocerts";

export const getNonOwnerFractions = (gitcoinEcocert: GitcoinEcocert) => {
	return (
		gitcoinEcocert.allFractions?.filter(
			(f) => f.ownerAddress !== gitcoinEcocert.creatorAddress,
		) ?? []
	);
};

export const getSplitStatusAndDataByUnitsComparision = (
	ownerFractions: {
		tokenId: string;
		units: string;
	}[],
	donorFractions: {
		address: string;
		units: string;
	}[],
) => {
	const donorHashmapByUnits = new Map<string, string[]>();
	const unitsToDonate = donorFractions.map((f) => f.units);
	unitsToDonate.map((units, index) => {
		const unitsStr = units.toString();
		const currentHashmapValue = donorHashmapByUnits.get(unitsStr);
		if (currentHashmapValue) {
			donorHashmapByUnits.set(unitsStr, [
				...currentHashmapValue,
				donorFractions[index].address,
			]);
		} else {
			donorHashmapByUnits.set(unitsStr, [donorFractions[index].address]);
		}
	});

	const donorFractionsToTransfer: {
		tokenId: string;
		units: string;
		address: string;
	}[] = [];

	const ownerUnits = ownerFractions.map((f) => f.units);
	ownerUnits.forEach((units, index) => {
		const donorAddress = donorHashmapByUnits.get(units)?.pop();
		if (!donorAddress) return;
		donorFractionsToTransfer.push({
			tokenId: ownerFractions[index].tokenId,
			units: units,
			address: donorAddress,
		});
	});

	const isAlreadySplit = donorHashmapByUnits
		.entries()
		.every(([units, addresses]) => addresses.length === 0);

	return {
		isAlreadySplit,
		donorFractionsToTransfer,
	};
};
