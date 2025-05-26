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

export type ChangelogBlock = {
	date: string;
	title: string;
	githubURL?: string;
	versionMetadata?: {
		version: string;
		isMajorRelease?: boolean;
	};
	contentSource: string;
};
