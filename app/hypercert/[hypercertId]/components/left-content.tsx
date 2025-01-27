import type { FullHypercert } from "@/app/graphql-queries/hypercerts";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import React from "react";
import PaymentFlow from "./PaymentFlow";
import NFT3D from "./nft-3d";
import Support from "./support";

const LeftContent = ({ hypercert }: { hypercert: FullHypercert }) => {
	return (
		<div className="flex w-full flex-initial flex-col gap-6 md:w-auto md:flex-[3]">
			{hypercert.image && (
				<div className="flex w-full flex-col items-center justify-center overflow-hidden rounded-2xl border border-border bg-beige-muted/80 p-2">
					<div className="w-full max-w-sm">
						<NFT3D src={hypercert.image} />
					</div>
					{/* <div className="flex w-full scale-100 items-center justify-center border-t border-t-border bg-background p-4 shadow-[0px_-10px_20px_rgba(0,0,0,0.1)]">
						<PaymentFlow hypercert={hypercert}>
							<Button className="gap-2">
								<Heart size={20} />
								Buy a fraction
							</Button>
						</PaymentFlow>
					</div> */}
					<section className="mt-2 flex w-full flex-col gap-4 rounded-xl bg-background p-3 shadow-[0px_-10px_20px_rgba(0,0,0,0.1)]">
						<h2 className="font-baskerville font-bold text-muted-foreground text-xl">
							Description
						</h2>
						<p>{hypercert.description}</p>
					</section>
				</div>
			)}

			<Support hypercert={hypercert} />
		</div>
	);
};

export default LeftContent;
