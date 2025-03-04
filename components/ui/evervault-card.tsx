"use client";
import { cn } from "@/lib/utils";
import { type MotionValue, useMotionValue } from "framer-motion";
import { motion, useMotionTemplate } from "framer-motion";
import type React from "react";
import { useEffect, useState } from "react";

export const EvervaultCard = ({
	children,
	className,
	gradientClassName = "bg-gradient-to-r from-lime-300 to-green-300",
}: {
	children?: React.ReactNode;
	className?: string;
	gradientClassName?: string;
}) => {
	const mouseX = useMotionValue(0);
	const mouseY = useMotionValue(0);

	const [randomString, setRandomString] = useState("");

	useEffect(() => {
		const str = generateRandomString(1500);
		setRandomString(str);
	}, []);

	function onMouseMove({
		currentTarget,
		clientX,
		clientY,
	}: {
		currentTarget: HTMLDivElement;
		clientX: number;
		clientY: number;
	}) {
		const { left, top } = currentTarget.getBoundingClientRect();
		mouseX.set(clientX - left);
		mouseY.set(clientY - top);

		const str = generateRandomString(1500);
		setRandomString(str);
	}

	return (
		<div
			className={cn(
				"relative flex items-center justify-center rounded-2xl bg-muted/50 p-0.5",
				className,
			)}
		>
			<div
				onMouseMove={onMouseMove}
				className="group/card relative flex h-full w-full items-center justify-center overflow-hidden rounded-2xl bg-transparent"
			>
				<CardPattern
					mouseX={mouseX}
					mouseY={mouseY}
					randomString={randomString}
					gradientClassName={gradientClassName}
				/>
				<div className="relative z-10 flex items-center justify-center p-2 py-4">
					<span className="z-20 text-black dark:text-white">{children}</span>
				</div>
			</div>
		</div>
	);
};

export function CardPattern({
	mouseX,
	mouseY,
	randomString,
	gradientClassName,
}: {
	mouseX: MotionValue<number>;
	mouseY: MotionValue<number>;
	randomString: string;
	gradientClassName: string;
}) {
	const maskImage = useMotionTemplate`radial-gradient(250px at ${mouseX}px ${mouseY}px, white, transparent)`;
	const style = { maskImage, WebkitMaskImage: maskImage };

	return (
		<div className="pointer-events-none">
			<div className="absolute inset-0 rounded-2xl [mask-image:linear-gradient(white,transparent)] group-hover/card:opacity-50" />
			<motion.div
				className={cn(
					"absolute inset-0 rounded-2xl opacity-0 backdrop-blur-xl transition duration-500 group-hover/card:opacity-100",
					gradientClassName,
				)}
				style={style}
			/>
			<motion.div
				className="absolute inset-0 rounded-2xl opacity-0 mix-blend-overlay group-hover/card:opacity-100"
				style={style}
			>
				<p className="absolute inset-x-0 h-full whitespace-pre-wrap break-words font-bold font-mono text-white text-xs transition duration-500">
					{randomString}
				</p>
			</motion.div>
		</div>
	);
}

const characters =
	"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
export const generateRandomString = (length: number) => {
	let result = "";
	for (let i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * characters.length));
	}
	return result;
};

export const Icon = ({
	className,
	...rest
}: React.HTMLAttributes<SVGElement>) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			strokeWidth="1.5"
			stroke="currentColor"
			className={className}
			{...rest}
		>
			<title>Icon</title>
			<path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
		</svg>
	);
};
