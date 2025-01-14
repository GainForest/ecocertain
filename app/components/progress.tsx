"use client";
import { motion } from "framer-motion";
import type React from "react";

const Progress = ({
	percentage,
	...props
}: { percentage: number } & React.HTMLAttributes<HTMLDivElement>) => {
	return (
		<div
			{...props}
			className={`h-2 w-full overflow-hidden rounded-full bg-accent${
				props.className ?? ""
			}`}
		>
			<motion.div
				className="h-full bg-primary"
				initial={{ width: "0%" }}
				animate={{ width: `${5 + (percentage / 100) * 95}%` }}
				transition={{ duration: 0.5 }}
			/>
		</div>
	);
};

export default Progress;
