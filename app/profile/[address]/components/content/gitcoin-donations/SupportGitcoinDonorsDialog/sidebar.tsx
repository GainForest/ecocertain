import { motion } from "framer-motion";
import { BadgeDollarSign, DollarSign, Sparkle } from "lucide-react";

const CardLine = ({
	width,
	delayInMs = 0,
}: {
	width: number;
	delayInMs?: number;
}) => {
	return (
		<motion.div
			className="h-6 rounded-lg"
			style={{ width: `${width}%` }}
			initial={{
				background: "rgb(0 0 0 / 0.1)",
			}}
			animate={{
				background: [
					"rgb(0 0 0 / 0.1)",
					"rgb(0 0 0 / 0.1)",
					"rgb(0 0 0 / 0.1)",
					"rgb(0 255 0 / 0.2)",
					"rgb(0 0 0 / 0.1)",
				],
				transition: {
					delay: delayInMs / 1000,
					repeatDelay: 1,
					repeat: Number.POSITIVE_INFINITY,
					duration: 4,
					times: [0, 0.5, 0.75, 0.8, 1],
				},
			}}
		/>
	);
};

const Sidebar = () => {
	return (
		<div
			className="relative flex h-full items-center justify-center"
			style={{
				perspective: "900px",
			}}
		>
			<motion.div
				className="absolute right-0 bottom-20 left-0 flex items-center justify-center"
				initial={{
					opacity: 0,
					scale: 1.2,
					filter: "blur(10px)",
					y: 100,
				}}
				animate={{
					opacity: 1,
					scale: 1,
					filter: "blur(0px)",
					y: 0,
				}}
				transition={{
					delay: 4,
					duration: 2,
				}}
			>
				<motion.div
					animate={{ rotate: 360 }}
					transition={{ repeat: Number.POSITIVE_INFINITY, duration: 3 }}
				>
					<Sparkle
						className="animate-pulse text-beige-muted-foreground"
						size={40}
					/>
				</motion.div>
			</motion.div>
			<motion.div
				className="absolute flex w-[80%] items-center justify-end rounded-lg bg-white p-4"
				initial={{
					opacity: 0,
					filter: "blur(10px)",
					scale: 1.2,
					bottom: 0,
				}}
				animate={{
					opacity: [0, 1, 1, 1, 0, 0],
					filter: [
						"blur(10px)",
						"blur(0px)",
						"blur(0px)",
						"blur(1px)",
						"blur(10px)",
						"blur(10px)",
					],
					scale: [1.2, 1, 1, 0.7, 0.7, 1.2],
					bottom: [0, 64, 64, 432, 432, 0],
				}}
				transition={{
					delay: 6,
					duration: 5,
					times: [0, 0.4, 0.5, 0.7, 0.9, 1],
					repeat: Number.POSITIVE_INFINITY,
					ease: "easeInOut",
				}}
			>
				<BadgeDollarSign
					className="text-muted-foreground opacity-50"
					size={40}
				/>
			</motion.div>
			<motion.div
				initial={{
					opacity: 0,
					scale: 1.2,
					filter: "blur(10px)",
				}}
				animate={{
					opacity: [0, 1, 1, 1],
					scale: [1.2, 1, 1, 1],
					filter: ["blur(10px)", "blur(0px)", "blur(0px)", "blur(0px)"],
					y: ["0%", "0%", "0%", "-100%"],
					transition: {
						duration: 4,
						times: [0, 0.5, 0.55, 1],
					},
				}}
			>
				<motion.div
					className="flex h-60 w-48 flex-col gap-3 rounded-xl border border-border bg-background p-3"
					initial={{
						scale: 1,
						boxShadow: "0px 8px 20px rgb(0 0 0 / 0.1)",
					}}
					animate={{
						scale: [1, 1, 1.075, 1.075, 1, 1],
						boxShadow: [
							"0px 8px 20px rgb(0 0 0 / 0.1)",
							"0px 8px 20px rgb(0 0 0 / 0.1)",
							"0px 4px 10px rgb(0 255 0 / 0.1)",
							"0px 4px 10px rgb(0 255 0 / 0.1)",
							"0px 8px 20px rgb(0 0 0 / 0.1)",
							"0px 8px 20px rgb(0 0 0 / 0.1)",
						],
						transition: {
							delay: 6,
							duration: 4,
							repeatDelay: 1,
							times: [0, 0.75, 0.8, 0.85, 0.9, 1],
							repeat: Number.POSITIVE_INFINITY,
						},
					}}
				>
					<div className="h-28 w-full rounded-lg bg-muted" />
					<div className="flex w-full flex-col gap-1">
						<CardLine width={50} delayInMs={6000} />
						<CardLine width={80} delayInMs={6150} />
						<CardLine width={33} delayInMs={6300} />
					</div>
				</motion.div>
			</motion.div>
			<div className="absolute right-4 bottom-4 left-4 text-center font-baskerville font-bold text-beige-muted-foreground text-xl">
				Support Gitcoin Donors
			</div>
		</div>
	);
};

export default Sidebar;
