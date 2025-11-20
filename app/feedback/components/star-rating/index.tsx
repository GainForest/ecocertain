import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

export function StarRating({ rating }: { rating: number }) {
	return (
		<div className="flex items-center gap-1">
			{[1, 2, 3, 4, 5].map((star) => (
				<Star
					key={star}
					className={cn(
						"h-4 w-4",
						star <= rating
							? "fill-yellow-400 text-yellow-400"
							: "text-slate-300",
					)}
				/>
			))}
		</div>
	);
}
