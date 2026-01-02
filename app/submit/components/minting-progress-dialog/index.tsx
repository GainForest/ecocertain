import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/modern-dialog-extended";
import { motion } from "framer-motion";
import { Sparkle } from "lucide-react";
import React from "react";
import type { MintingFormValues } from "../hypercert-form";
import MintingProgress from "./minting-progress";

const MintingProgressDialog = ({
	mintingFormValues,
	generateImage,
	geoJSONFile,
	badges,
	visible,
	setVisible,
	submissionId,
}: {
	mintingFormValues: MintingFormValues | undefined;
	generateImage: () => Promise<string | undefined>;
	geoJSONFile: File | null;
	badges: string[];
	visible?: boolean;
	setVisible: (visible: boolean) => void;
	submissionId: string;
}) => {
	return (
		<Dialog open={visible} onOpenChange={(value) => setVisible(value)}>
			<DialogContent
				sidebarChildren={
					<div
						className="flex h-full items-center justify-center"
						style={{
							perspective: "900px",
						}}
					>
						<motion.div
							style={{
								transformStyle: "preserve-3d",
							}}
							initial={{
								opacity: 0,
								scale: 1.2,
								rotateX: 0,
								filter: "blur(10px)",
							}}
							animate={{
								opacity: [0, 1, 1, 1],
								scale: [1.2, 1, 1, 1],
								filter: ["blur(10px)", "blur(0px)", "blur(0px)", "blur(0px)"],
								rotateX: [0, 0, 0, 70],
								y: [0, 0, 0, 40],
								transition: {
									duration: 4,
									times: [0, 0.5, 0.7, 1],
								},
							}}
						>
							<motion.div
								className="flex h-60 w-48 flex-col gap-3 rounded-xl border border-border bg-background p-3 shadow-lg"
								animate={{
									y: [0, 20, 0],
									transition: {
										times: [0, 0.5, 1],
										repeat: Number.POSITIVE_INFINITY,
										duration: 2,
										delay: 4,
									},
								}}
							>
								<div className="h-28 w-full rounded-lg bg-muted" />
								<div className="flex w-full flex-col gap-1">
									<div className="h-6 w-[50%] rounded-lg bg-muted" />
									<div className="h-6 w-[80%] rounded-lg bg-muted" />
									<div className="h-6 w-[33%] rounded-lg bg-muted" />
								</div>
							</motion.div>
						</motion.div>
						<motion.div
							className="absolute inset-0 flex items-center justify-center"
							initial={{
								opacity: 0,
								scale: 1.2,
								filter: "blur(10px)",
								y: -80,
							}}
							animate={{
								opacity: 1,
								scale: 1,
								filter: "blur(0px)",
								y: -50,
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
						<div className="absolute right-4 bottom-4 left-4 text-center font-baskerville font-bold text-3xl text-beige-muted-foreground">
							Mint
						</div>
					</div>
				}
			>
				<DialogHeader>
					<DialogTitle className="font-baskerville">
						Create Hypercert
					</DialogTitle>
					<DialogDescription className="font-sans text-base">
						View the progress of your new hypercert being minted.
					</DialogDescription>
				</DialogHeader>
				{mintingFormValues && (
					<MintingProgress
						{...{
							mintingFormValues,
							generateImage,
							geoJSONFile,
							badges,
							visible,
							setVisible,
							submissionId,
						}}
					/>
				)}
			</DialogContent>
		</Dialog>
	);
};

export default MintingProgressDialog;
