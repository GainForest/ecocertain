import { Button } from "@/components/ui/button";
import { ArrowUpRight, Calendar } from "lucide-react";
import Link from "next/link";
import React from "react";
import { ChangeLogBlock, type ChangeLogBlockCatalog } from "../config";

const GithubReleaseBlock = ({
	block,
}: {
	block: ChangeLogBlockCatalog["githubRelease"];
}) => {
	return (
		<div
			key={block.title}
			className="flex flex-col gap-1 rounded-3xl border border-primary bg-background px-4 py-3 md:px-6"
		>
			<section className="flex flex-col items-start justify-between gap-1 md:flex-row md:items-center">
				<h2 className="font-bold text-beige-muted-foreground text-xl md:text-2xl">
					{block.title}
				</h2>
				<div className="flex flex-wrap items-center justify-start gap-4">
					<span className="flex items-center justify-center gap-1 font-sans text-muted-foreground text-sm">
						<Calendar size={16} />
						<span>{block.date}</span>
					</span>
					<Link
						href={block.linkToRelease}
						target="_blank"
						rel="noopener noreferrer"
						className="flex items-center gap-1 font-medium font-sans text-primary text-sm hover:underline"
					>
						View on GitHub
						<ArrowUpRight size={16} />
					</Link>
				</div>
			</section>
			<p className="line-clamp-2 text-muted-foreground">{block.description}</p>
		</div>
	);
};

export default GithubReleaseBlock;
