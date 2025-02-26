import {
	GitBranch,
	GitPullRequest,
	type LucideProps,
	MessageCircle,
} from "lucide-react";
import type React from "react";

type ChangelogButton = {
	label: string;
	href: string;
	icon: React.FC<LucideProps>;
	openInNewTab: boolean;
};

export const changelogButtons: ChangelogButton[] = [
	{
		label: "View Repository",
		href: "https://github.com/GainForest/hypercerts-platform.git",
		icon: GitBranch,
		openInNewTab: true,
	},
	{
		label: "Have a suggestion / bug?",
		href: "https://github.com/GainForest/hypercerts-platform/issues",
		icon: MessageCircle,
		openInNewTab: true,
	},
	{
		label: "View changelog in Github",
		href: "https://github.com/GainForest/hypercerts-platform/releases",
		icon: GitPullRequest,
		openInNewTab: true,
	},
];

type NormalBlock = {
	type: "normal";
	title: string;
	description: string;
	date: string;
	linkToPullRequest?: string;
};

type GithubReleaseBlock = {
	type: "github-release";
	title: string;
	description: string;
	date: string;
	linkToRelease: string;
};

export type ChangeLogBlockCatalog = {
	normal: NormalBlock;
	githubRelease: GithubReleaseBlock;
};

export type ChangeLogBlock = ChangeLogBlockCatalog[keyof ChangeLogBlockCatalog];
