import { motion } from "framer-motion";
import type React from "react";

const AnimatedSplitSection = ({
	children,
	position,
}: {
	children: React.ReactNode;
	position: "left" | "right";
} & React.HTMLAttributes<HTMLDivElement>) => {
	const x = position === "left" ? -100 : 100;
	return (
		<motion.div
			className={"flex-1"}
			initial={{
				width: 0,
				opacity: 0,
				x: x,
				filter: "blur(10px)",
			}}
			animate={{
				width: "auto",
				opacity: 1,
				x: 0,
				filter: "blur(0px)",
				transition: {
					width: { type: "spring", stiffness: 300, damping: 30 },
					opacity: { duration: 0.2 },
				},
			}}
			exit={{
				width: 0,
				opacity: 0,
				x: x,
				filter: "blur(10px)",
				transition: {
					width: { type: "spring", stiffness: 300, damping: 30 },
					opacity: { duration: 0.2 },
				},
			}}
			layout
		>
			{children}
		</motion.div>
	);
};

export default AnimatedSplitSection;
