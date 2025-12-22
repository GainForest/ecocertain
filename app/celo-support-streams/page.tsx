import { Button } from "@/components/ui/button";
import { MotionWrapper } from "@/components/ui/motion-wrapper";
import { ArrowUpRight, ChevronLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import RoundData from "./RoundData";

const ROUND_0_START = 1742169600; // 17 March
const ROUND_DURATION = 2 * 7 * 24 * 60 * 60; // Two weeks
const TOTAL_ROUNDS =
	Math.floor(Date.now() / 1000 - ROUND_0_START) / ROUND_DURATION;

const ROUNDS = Array.from({ length: TOTAL_ROUNDS }, (_, i) => ({
	id: i,
	starts: ROUND_0_START + i * ROUND_DURATION,
	ends: ROUND_0_START + (i + 1) * ROUND_DURATION,
}));

const ROUNDS_REVERSED = ROUNDS.reverse();

export default async function CeloSupportStreams() {
	return (
		<MotionWrapper
			type="main"
			className="flex w-full flex-col items-center justify-start"
			initial={{ opacity: 0, filter: "blur(10px)" }}
			animate={{ opacity: 1, filter: "blur(0px)" }}
			transition={{ duration: 0.5 }}
		>
			<div className="flex w-full max-w-6xl flex-col gap-2 p-8">
				<Link href={"/"}>
					<Button variant={"link"} className="gap-2 p-0">
						<ChevronLeft size={20} /> Browse ecocerts
					</Button>
				</Link>
				<div className="flex flex-col justify-start gap-4">
					<h1 className="font-baskerville font-bold text-3xl text-beige-muted-foreground leading-tight">
						Celo Support Streams
					</h1>
					<div className="flex items-start gap-4">
						<div className="hidden flex-col gap-2 md:flex">
							<Image
								src="/assets/media/images/celo-support-streams.png"
								alt="Celo Support Streams"
								width={300}
								height={600}
								className="h-auto w-[300px] rounded-lg border border-beige-muted shadow-xl"
							/>
							<Link
								href="https://www.celopg.eco/programs/celo-support-streams-s0"
								target="_blank"
								className="w-full"
							>
								<Button
									variant={"outline"}
									className="w-full gap-2 border-beige-muted"
								>
									<span>View on CeloPG</span>
									<ArrowUpRight size={16} />
								</Button>
							</Link>
						</div>
						<div className="flex-1">
							<ul className="flex flex-col gap-1">
								{ROUNDS_REVERSED.map((round) => (
									<RoundData key={round.id} round={round} />
								))}
							</ul>
						</div>
					</div>
				</div>
			</div>
		</MotionWrapper>
	);
}
