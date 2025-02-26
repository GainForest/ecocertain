import type { ChangeLogBlock } from "./config";

const changelogBlocks: ChangeLogBlock[] = [
	{
		type: "github-release",
		title: "v1.0.0 - Initial Release",
		description:
			"Stable launch release for ecocertain. Users can create, buy, and view ecocerts on the Celo Network. Also supports Sepolia for testing environments.",
		date: "6 Feb, 2025",
		linkToRelease:
			"https://github.com/GainForest/hypercerts-platform/releases/tag/v1.0.0",
	},
	{
		type: "normal",
		title: "v1.0.0 - Initial Release",
		description: "We are soon preparing",
		date: "6 Feb, 2025",
		linkToPullRequest:
			"https://github.com/GainForest/hypercerts-platform/pull/1",
	},
];

export default changelogBlocks;
