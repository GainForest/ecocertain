import { Button } from "@/components/ui/button";
import { ArrowUpRight, Calendar, GitBranch, GitMerge } from "lucide-react";
import Link from "next/link";
import React from "react";

import { type ChangelogBlock, changelogButtons } from "./config";
import changelogBlocks from "./data";

import { readFileSync } from "node:fs";
import path from "node:path";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import MarkdownPreview from "./_components/MarkdownPreview";

const Label = ({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) => {
	return (
		<span
			className={cn(
				"flex items-center gap-2 rounded-full bg-muted px-2 py-1 text-muted-foreground text-sm",
				className,
			)}
		>
			{children}
		</span>
	);
};

const Page = () => {
	const getMarkdownContentFromSource = (source: string) => {
		if (source.startsWith("!")) {
			const fileName = source.slice(1);
			const filePath = path.join(
				process.cwd(),
				"app",
				"changelog",
				"sources",
				fileName,
			);
			return readFileSync(filePath, "utf-8");
		}
		return null;
	};

	return (
		<main className="w-full">
			{/* <main className="container grid max-w-screen-lg auto-rows-auto grid-cols-1 flex-col gap-4 p-4 pb-24 text-vd-blue-900 md:grid-cols-3 md:px-6 md:py-8"> */}
			{/* <section className="flex flex-col items-center p-4 md:p-8 gap-4"> */}
			<section className="container mt-2 flex max-w-6xl flex-col gap-4 pb-[64px] md:mt-8 md:pb-12">
				<header className="flex w-full flex-col gap-2 pt-4">
					<h1 className="text-balance text-center font-baskerville font-bold text-2xl md:text-3xl">
						Changelog
					</h1>
					<p className="mt-1 text-center text-muted-foreground text-sm">
						The latest updates and improvements to Ecocertain.
					</p>
				</header>
				<div className="flex flex-wrap items-center justify-center gap-4">
					{changelogButtons.map((button) => (
						<Link
							key={button.label}
							href={button.href}
							{...(button.openInNewTab && { target: "_blank" })}
							rel="noopener noreferrer"
						>
							<Button variant={"outline"} className="gap-2 rounded-full">
								<button.icon size={16} className="my-2 opacity-50" />
								<span className="text-primary">{button.label}</span>
							</Button>
						</Link>
					))}
				</div>
			</section>
			<section className="bg-background p-4">
				<div className="mt-4 flex flex-col items-center gap-4 font-sans">
					{changelogBlocks.map((block, index) => {
						const content = getMarkdownContentFromSource(block.contentSource);
						if (!content) {
							return null;
						}
						return (
							<React.Fragment key={block.title}>
								{index > 0 && <Separator />}
								<div className="group flex w-full max-w-6xl flex-col items-start justify-start gap-4 px-2 md:flex-row md:px-4">
									<div className="flex min-w-48 flex-grow-[auto] items-center justify-start md:flex-grow">
										<span className="flex items-center gap-2 rounded-full border border-transparent bg-transparent px-2 py-1 text-muted-foreground text-sm transition-colors group-hover:border-border group-hover:bg-muted">
											{block.date}
										</span>
									</div>
									<div className="flex w-full flex-grow-[auto] flex-col gap-4 md:w-auto md:flex-grow-[2]">
										<section className="flex flex-col gap-2">
											<h1 className="font-bold text-3xl">{block.title}</h1>
											<div className="flex items-center gap-2">
												{block.versionMetadata && (
													<>
														{block.versionMetadata.isMajorRelease && (
															<Label className="bg-beige-muted font-bold text-beige-muted-foreground">
																Major Release
															</Label>
														)}
														<Label>{block.versionMetadata.version}</Label>
													</>
												)}
												{block.githubURL && (
													<Link href={block.githubURL} target="_blank">
														<Label className="bg-primary/10 text-primary">
															<GitMerge size={14} />
															View
														</Label>
													</Link>
												)}
											</div>
										</section>
										<MarkdownPreview markdown={content} />
									</div>
								</div>
							</React.Fragment>
						);
					})}
				</div>
			</section>
		</main>
	);
};

export default Page;
