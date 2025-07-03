import type { Fraction } from "@/app/graphql-queries/fractions-by-hypercert";
import type { Hypercert } from "@/app/graphql-queries/hypercerts";
import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { gainforestMultisigForTransfers } from "@/config/gainforest";
import useCopy from "@/hooks/use-copy";
import { Check, CircleAlert, Copy } from "lucide-react";
import { useMemo } from "react";

const Form = ({
	hypercert,
	fractions,
	selectedFractionId,
	setSelectedFractionId,
	recipientAddress,
	setRecipientAddress,
}: {
	hypercert: Hypercert;
	fractions: Fraction[];
	selectedFractionId: string | undefined;
	setSelectedFractionId: (value: string | undefined) => void;
	recipientAddress: string;
	setRecipientAddress: (value: string) => void;
}) => {
	const { copy, isCopied } = useCopy();

	const pricePerUnitInUSD = useMemo(() => {
		if (!hypercert) return undefined;
		const { totalUnits, pricePerPercentInUSD } = hypercert;
		if (!pricePerPercentInUSD) return undefined;
		const PRECISION = 10n ** 10n;
		const pricePerUnitInUSD =
			(BigInt(Math.floor(pricePerPercentInUSD * Number(PRECISION))) * 100n) /
			totalUnits;
		return Number(pricePerUnitInUSD) / Number(PRECISION);
	}, [hypercert]);

	const fractionsOptions = useMemo(() => {
		return fractions.map((fraction) => ({
			value: fraction.fractionId,
			label: `${fraction.units} units ${
				pricePerUnitInUSD
					? `- ${(Number(fraction.units) * pricePerUnitInUSD).toFixed(2)} USD`
					: ""
			}`,
		}));
	}, [fractions, pricePerUnitInUSD]);

	const selectedFraction = useMemo(() => {
		if (!fractions || !selectedFractionId) return undefined;
		return fractions.find(
			(fraction) => fraction.fractionId === selectedFractionId,
		);
	}, [fractions, selectedFractionId]);

	return (
		<div className="flex flex-col gap-6">
			<div className="flex items-center gap-2 rounded-lg bg-muted/80 p-2 text-muted-foreground">
				<CircleAlert size={16} />
				<span className="font-bold text-sm">
					Once an ecocert is transferred, it can not be re-transferred to
					another user. All transfers are final.
				</span>
			</div>
			<div className="flex items-center gap-2 rounded-lg bg-muted/80 p-2 text-muted-foreground">
				<CircleAlert size={16} />
				<span className="font-bold text-sm">
					Transferring a fraction of ecocert might unlist it from sale.
				</span>
			</div>
			<div className="flex flex-col gap-1">
				<span className="font-bold text-muted-foreground text-sm">
					Select a fraction by units
				</span>
				<div className="w-full overflow-hidden rounded-xl border border-border">
					<Combobox
						options={fractionsOptions}
						value={selectedFractionId}
						onChange={setSelectedFractionId}
						placeholder="Select a fraction"
						className="w-full rounded-none border-none"
						popoverClassName="w-full"
					/>
					<div className="flex flex-col gap-2 border-t border-t-border bg-beige-muted/40 p-2">
						<div className="flex flex-col gap-1">
							<span className="font-bold text-beige-muted-foreground text-xs">
								Fraction ID (scroll to see full)
							</span>
							<div className="flex items-center overflow-hidden rounded-lg border border-border bg-background">
								<div className="relative flex h-8 flex-1 items-center">
									<input
										value={`${selectedFractionId}          `}
										className="h-8 flex-1 pl-2 text-sm"
										readOnly
										disabled
									/>
									<div className="pointer-events-none absolute top-0 right-0 bottom-0 w-36 bg-gradient-to-r from-background/0 to-background/100" />
								</div>
								<button
									type="button"
									className="h-8 border-l border-l-border px-2"
									onClick={() => copy(selectedFractionId ?? "")}
								>
									{isCopied ? <Check size={14} /> : <Copy size={14} />}
								</button>
							</div>
						</div>
						<div className="flex flex-col gap-1">
							<span className="font-bold text-beige-muted-foreground text-xs">
								Price of fraction
							</span>
							<span className="font-bold text-sm">
								{!selectedFraction || !pricePerUnitInUSD
									? "Ecocert not listed for sale yet."
									: `${(
											Number(selectedFraction.units) * pricePerUnitInUSD
									  ).toFixed(2)} USD`}
							</span>
						</div>
					</div>
				</div>
			</div>
			<div className="flex flex-col gap-1">
				<span className="font-bold text-muted-foreground text-sm">
					Recipient address
				</span>
				<Input
					placeholder="0x1234..."
					value={recipientAddress}
					onChange={(e) => setRecipientAddress(e.target.value)}
				/>
			</div>
		</div>
	);
};

export default Form;
