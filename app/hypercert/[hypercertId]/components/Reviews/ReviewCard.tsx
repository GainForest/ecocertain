import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import EthAvatar from "@/components/ui/eth-avatar";
import MarkdownEditor from "@/components/ui/mdx-editor";
import UserChip from "@/components/user-chip";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Heart } from "lucide-react";
import { useState } from "react";
import type { Review } from "./types";

dayjs.extend(relativeTime);

const ReviewCard = ({ review }: { review: Review }) => {
	const [likes, setLikes] = useState(review.likes);
	const [hasLiked, setHasLiked] = useState(review.hasLiked);

	const handleLike = () => {
		if (hasLiked) {
			setLikes((prev) => prev - 1);
		} else {
			setLikes((prev) => prev + 1);
		}
		setHasLiked(!hasLiked);
	};

	return (
		<Card className="flex flex-col overflow-hidden">
			<div className="flex flex-col gap-4 p-4">
				{/* Header */}
				<div className="flex items-center gap-2">
					<EthAvatar address={review.authorAddress} size={36} />
					<div className="flex flex-col">
						<UserChip
							address={review.authorAddress}
							className="border-none bg-transparent p-0 font-bold text-sm"
							showCopyButton="hover"
							showAvatar={false}
						/>
						<span className="text-muted-foreground text-xs">
							{dayjs(review.timestamp).fromNow()}
						</span>
					</div>
				</div>

				{/* Body */}
				<MarkdownEditor
					markdown={review.text}
					className="text-muted-foreground text-sm"
					editorRef={null}
					showToolbar={false}
					readOnly={true}
				/>
			</div>

			{/* Footer */}
			{/* <div className="flex items-center justify-end border-t border-t-border/30 bg-muted/40 p-2">
				<Button
					variant="ghost"
					size="sm"
					className={cn(
						"flex items-center gap-1",
						hasLiked ? "text-red-500" : "",
					)}
					onClick={handleLike}
				>
					<Heart size={16} className={hasLiked ? "fill-current" : ""} />
					<span>{likes}</span>
				</Button>
			</div> */}
		</Card>
	);
};

export default ReviewCard;
