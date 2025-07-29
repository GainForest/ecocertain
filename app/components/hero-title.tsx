"use client";

import { motion } from "framer-motion";
import React from "react";

const HeroTitleVariants = {
	initial: {
		opacity: 0,
		y: 100,
		filter: "blur(20px)",
	},
	animate: {
		opacity: 1,
		y: 0,
		filter: "blur(0px)",
	},
};

const HeroTitle = () => {
	return (
		<h2 className="absolute right-0 bottom-0 left-0">
			<div className="relative flex flex-col items-center gap-2 px-4 py-6 text-center font-baskerville font-bold text-4xl text-foreground/80 leading-none">
				<motion.div
					className="absolute top-[50%] left-[50%] h-36 w-60 rounded-full bg-beige blur-xl sm:w-72"
					initial={{ opacity: 1, scale: 1.5, x: "-50%", y: "-50%" }}
				/>
				<motion.div
					className="absolute top-[50%] left-[50%] aspect-square h-20 rounded-full bg-green-500 blur-3xl"
					initial={{ opacity: 0, scale: 0.6, x: "-50%", y: "-50%" }}
					animate={{ opacity: 1, scale: 1.5, x: "-50%", y: "-50%" }}
					transition={{ duration: 3 }}
				/>
				<motion.span
					style={{
						textShadow: "0px 0px 10px hsl(var(--beige))",
					}}
					variants={HeroTitleVariants}
					initial={"initial"}
					animate={"animate"}
					transition={{
						duration: 0.5,
					}}
				>
					Fund
				</motion.span>
				<motion.span
					variants={HeroTitleVariants}
					initial={"initial"}
					animate={"animate"}
					transition={{
						duration: 0.5,
						delay: 0.2,
					}}
					className="inline-block bg-gradient-to-b from-green-500 to-green-800 bg-clip-text px-4 py-1 font-bold text-6xl text-transparent italic"
				>
					impactful
				</motion.span>
				<motion.span
					style={{
						textShadow: "0px 0px 10px hsl(var(--beige))",
					}}
					variants={HeroTitleVariants}
					initial={"initial"}
					animate={"animate"}
					transition={{
						duration: 0.5,
						delay: 0.4,
					}}
				>
					regenerative projects.
				</motion.span>
			</div>
		</h2>
	);
};

export default HeroTitle;
