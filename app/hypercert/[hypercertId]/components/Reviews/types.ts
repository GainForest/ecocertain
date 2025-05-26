export type Review = {
	id: string;
	text: string;
	authorAddress: `0x${string}`;
	likes: number;
	timestamp: number;
	hasLiked: boolean;
};
