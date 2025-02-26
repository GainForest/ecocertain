import { Button } from "@/components/ui/button";
import { ArrowUpRight, Calendar } from "lucide-react";
import Link from "next/link";
import React from "react";
import { ChangeLogBlock, type ChangeLogBlockCatalog } from "../config";

const NormalBlock = ({ block }: { block: ChangeLogBlockCatalog["normal"] }) => {
	return (
		<div
			key={block.title}
			className="flex flex-col gap-2 rounded-xl border border-border bg-background px-4 py-2 md:px-6"
		>
			<section className="flex flex-col items-start justify-between md:flex-row md:items-center">
				<h2 className="font-bold text-lg md:text-xl">{block.title}</h2>
				<div className="flex flex-wrap items-center justify-start gap-4">
					<span className="flex items-center justify-center gap-1 font-sans text-muted-foreground text-sm">
						<Calendar size={16} />
						<span>{block.date}</span>
					</span>
					{block.linkToPullRequest && (
						<Link
							href={block.linkToPullRequest}
							target="_blank"
							rel="noopener noreferrer"
							className="flex items-center gap-1 font-medium font-sans text-primary text-sm hover:underline"
						>
							View on GitHub
							<ArrowUpRight size={16} />
						</Link>
					)}
				</div>
			</section>
			<p className="text-muted-foreground">{block.description}</p>
		</div>
	);
};

export default NormalBlock;
