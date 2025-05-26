import type { ChangelogBlock } from "./config";

const changelogBlocks: ChangelogBlock[] = [
	{
		date: "February 10th 2025",
		title: "v1.0.0 - Initial Release",
		contentSource: "!file1.md",
		githubURL: "https://github.com/GainForest/ecocertain/pull/62",
		versionMetadata: {
			version: "1.0.0",
			isMajorRelease: true,
		},
	},
];

export default changelogBlocks;

// const changelogBlocks: ChangeLogBlock[] = [
// 	{
// 		type: "normal",
// 		title: "v1.0.0 - Initial Release",
// 		description:
// 			"Code optimization: Hypercerts image fetching, caching and error handling.",
// 		date: "February 27th 2025",
// 		linkToPullRequest: "https://github.com/GainForest/ecocertain/pull/77",
// 	},
// 	{
// 		type: "normal",
// 		title: "v1.0.0 - Initial Release",
// 		description:
// 			"UX improvements: Hypercert minting flow, improved error messages, and form handling.",
// 		date: "February 26th 2025",
// 		linkToPullRequest: "https://github.com/GainForest/ecocertain/pull/68",
// 	},
// 	{
// 		type: "normal",
// 		title: "v1.0.0 - Initial Release",
// 		description:
// 			"Major feature: Each hypercert's data explorer now queries the green globe, instead of impact trace.",
// 		date: "February 26th 2025",
// 		linkToPullRequest: "https://github.com/GainForest/ecocertain/pull/73",
// 	},
// 	{
// 		type: "normal",
// 		title: "v1.0.0 - Initial Release",
// 		description:
// 			'Feature improvement: Move the "My Hypercerts" page to the navbar, where it is more visible. Differentiate between created and supported hypercerts. ',
// 		date: "February 13th 2025",
// 		linkToPullRequest: "https://github.com/GainForest/ecocertain/pull/63",
// 	},
// 	{
// 		type: "normal",
// 		title: "v1.0.0 - Initial Release",
// 		description: "Minor UI/UX improvement: Display sales chronologically. ",
// 		date: "February 12th 2025",
// 		linkToPullRequest: "https://github.com/GainForest/ecocertain/pull/62",
// 	},
// 	{
// 		type: "normal",
// 		title: "v1.0.0 - Initial Release",
// 		description:
// 			"Funds are now displayed in the original currency, instead of its USD equivalent. ",
// 		date: "February 10th 2025",
// 		linkToPullRequest: "https://github.com/GainForest/ecocertain/pull/62",
// 	},
// 	{
// 		type: "github-release",
// 		title: "v1.0.0 - Initial Release",
// 		description:
// 			"Stable launch release for ecocertain. Users can create, buy, and view ecocerts on the Celo Network. Also supports Sepolia for testing environments.",
// 		date: "February 6th 2025",
// 		linkToRelease:
// 			"https://github.com/GainForest/hypercerts-platform/releases/tag/v1.0.0",
// 	},
// ];

// export default changelogBlocks;
