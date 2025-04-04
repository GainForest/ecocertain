"use client";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import type React from "react";

const Progress = ({
	percentage,
	innerClassName,
	...props
}: {
	percentage: number;
	innerClassName?: string;
} & React.HTMLAttributes<HTMLDivElement>) => {
	return (
		<div
			{...props}
			className={cn(
				"h-2 w-full overflow-hidden rounded-full bg-accent",
				props.className,
			)}
		>
			<motion.div
				className={cn("h-full bg-primary", innerClassName)}
				initial={{ width: "0%" }}
				animate={{ width: `${2 + (percentage / 100) * 99}%` }}
				transition={{ duration: 0.5 }}
			/>
		</div>
	);
};

export default Progress;
