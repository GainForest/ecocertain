import { HypercertProvider } from "@/app/contexts/hypercert";
import type { Hypercert } from "@/app/graphql-queries/hypercerts";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import CardOptions from "./card-options";

export default function Card({ hypercert }: { hypercert: Hypercert }) {
	const { hypercertId, name, description } = hypercert;

	return (
		<HypercertProvider value={hypercert}>
			<article className="group relative flex flex-col overflow-hidden rounded-2xl border border-border">
				<div className="relative flex h-[200px] w-full items-start justify-center overflow-hidden rounded-t-2xl bg-muted p-4">
					<Image
						// src={`/api/hypercert/${hypercert_id}/image`}
						src={`/api/hypercert-image/${hypercertId}`}
						alt={name ?? "Untitled"}
						height={200}
						width={200}
						className="h-auto w-full transition group-hover:scale-[1.05] group-hover:blur-sm group-hover:brightness-75"
					/>
					{hypercertId !== undefined && (
						<div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100">
							<Link href={`/hypercert/${hypercertId}`} target="_blank" passHref>
								<Button variant={"secondary"} className="gap-2">
									View Hypercert <ArrowUpRight size={20} />
								</Button>
							</Link>
						</div>
					)}
				</div>
				<section
					className="w-full flex-1 space-y-2 border-t border-t-border bg-background/90 p-4 backdrop-blur-md"
					style={{
						boxShadow: "0 -10px 10px rgba(0, 0, 0, 0.1)",
					}}
				>
					{/* <div className="flex flex-wrap gap-1">
		<article className="group relative flex flex-col overflow-hidden rounded-2xl border border-border">
			<div className="relative flex h-[200px] w-full items-start justify-center overflow-hidden rounded-t-2xl bg-muted p-4">
				<Image
					// src={`/api/hypercert/${hypercert_id}/image`}
					src={`/api/hypercert-image/${hypercertId}`}
					alt={name ?? "Untitled"}
					height={200}
					width={200}
					className="h-auto w-full transition group-hover:scale-[1.05] group-hover:blur-sm group-hover:brightness-75"
				/>
				{hypercertId !== undefined && (
					<div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100">
						<Link href={`/hypercert/${hypercertId}`} target="_blank" passHref>
							<Button variant={"secondary"} className="gap-2">
								View Hypercert <ArrowUpRight size={20} />
							</Button>
						</Link>
					</div>
				)}
			</div>
			<section
				className="w-full flex-1 space-y-2 border-t border-t-border bg-background/90 p-4 backdrop-blur-md"
				style={{
					boxShadow: "0 -10px 10px rgba(0, 0, 0, 0.1)",
				}}
			>
				{/* <div className="flex flex-wrap gap-1">
          {workScope?.map((scope) => (
            <Badge
              key={scope}
              variant="secondary"
              className={"items-center justify-between rounded-3xl"}
            >
              <p className="ml-1 font-light text-xs">{scope}</p>
            </Badge>
          ))}
        </div> */}
					<p
						className={`line-clamp-2 max-h-12 flex-1 text-ellipsis font-baskerville font-semibold text-lg leading-5${
							name ? "text-foreground" : "text-muted-foreground"
						}`}
					>
						{name ?? "[Untitled]"}
					</p>
					<p
						className={
							"line-clamp-2 max-h-12 flex-1 text-ellipsis text-muted-foreground"
						}
					>
						{description ?? "..."}
					</p>
					<CardOptions />
				</section>
			</article>
		</HypercertProvider>
	);
}
