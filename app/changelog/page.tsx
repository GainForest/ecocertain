import { Button } from "@/components/ui/button";
import { ArrowUpRight, Calendar } from "lucide-react";
import Link from "next/link";
import React from "react";
import GithubReleaseBlock from "./_components/GithubReleaseBlock";
import NormalBlock from "./_components/NormalBlock";
import { type ChangeLogBlock, changelogButtons } from "./config";
import changelogBlocks from "./data";

const Page = () => {
	return (
		<main className="container mt-2 flex max-w-6xl flex-col gap-4 pb-[64px] md:mt-8 md:pb-12">
			{/* <main className="container grid max-w-screen-lg auto-rows-auto grid-cols-1 flex-col gap-4 p-4 pb-24 text-vd-blue-900 md:grid-cols-3 md:px-6 md:py-8"> */}
			{/* <section className="flex flex-col items-center p-4 md:p-8 gap-4"> */}
			<header className="flex w-full flex-col gap-2 pt-4">
				<h1 className="text-balance text-center font-baskerville font-bold text-3xl md:text-4xl">
					Changelog
				</h1>
				<p className="mt-1 text-center text-muted-foreground text-sm">
					See what's the latest to Ecocertain.
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
						<Button
							variant={"outline"}
							className="flex h-auto w-52 flex-col items-center"
						>
							<button.icon size={30} className="my-2 opacity-50" />
							<span className="text-primary">{button.label}</span>
						</Button>
					</Link>
				))}
			</div>
			<div className="mt-8 flex flex-col gap-2">
				{(changelogBlocks as ChangeLogBlock[]).map((block) => {
					switch (block.type) {
						case "normal":
							return <NormalBlock block={block} />;
						case "github-release":
							return <GithubReleaseBlock block={block} />;
						default:
							return null;
					}
				})}
			</div>
		</main>
	);
};

export default Page;
