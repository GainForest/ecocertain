"use client";

import useFullHypercert from "@/app/contexts/full-hypercert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import autoAnimate from "@formkit/auto-animate";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import {
	ChevronLeft,
	ChevronRight,
	Heart,
	Plus,
	PlusCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import AnimatedSplitSection from "./AnimatedSplitSection";
import ReviewCard from "./ReviewCard";
import ReviewForm from "./ReviewForm";
import type { Review } from "./types";

type DialogMode = "rw" | "r" | "w";

const SplitControls = ({
	mode,
	setMode,
}: {
	mode: DialogMode;
	setMode: (mode: DialogMode) => void;
}) => {
	if (mode !== "rw") return null;

	return (
		<>
			<div className="-translate-x-1/2 absolute top-0 bottom-0 left-1/2 w-[1px] bg-border" />
			<div className="-translate-x-1/2 absolute top-3 left-1/2 z-10 rounded-lg border border-border bg-background/80 p-1 backdrop-blur-sm">
				<div className="flex items-center gap-1">
					<Button
						variant="ghost"
						size="sm"
						onClick={() => setMode("w")}
						className="h-8 w-8 p-0"
					>
						<ChevronLeft size={20} />
					</Button>
					<div className="h-6 w-[1px] bg-border" />
					<Button
						variant="ghost"
						size="sm"
						onClick={() => setMode("r")}
						className="h-8 w-8 p-0"
					>
						<ChevronRight size={20} />
					</Button>
				</div>
			</div>
		</>
	);
};

const ReviewsDialog = ({
	open,
	onOpenChange,
	initialMode = "rw",
	reviews,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	initialMode: DialogMode;
	reviews: Review[];
}) => {
	const [mode, setMode] = useState<DialogMode>(initialMode);

	useEffect(() => {
		setMode(initialMode);
	}, [initialMode]);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[80vh] max-w-4xl overflow-hidden p-0">
				<div className="relative flex h-[80vh] items-start transition-all duration-300">
					<LayoutGroup>
						<AnimatePresence>
							<SplitControls mode={mode} setMode={setMode} />

							{/* Left side - Reviews List */}
							{mode !== "w" && (
								<AnimatedSplitSection position="left" key={"r-reviews"}>
									<div
										className={cn(
											"flex h-full flex-col px-6",
											mode === "rw" ? "pt-16" : "pt-6",
										)}
									>
										<AnimatePresence>
											{mode === "r" && (
												<motion.div
													className="w-full"
													initial={{ opacity: 0 }}
													animate={{ opacity: 1 }}
													exit={{ opacity: 0 }}
												>
													<Button
														size="sm"
														variant={"secondary"}
														onClick={() => setMode("rw")}
														className="mb-6 flex items-center gap-2"
													>
														<ChevronLeft size={16} />
														<span>Write a review</span>
													</Button>
												</motion.div>
											)}
										</AnimatePresence>
										<div className="flex items-center justify-between">
											<h2 className="font-baskerville font-semibold text-xl">
												All Reviews
											</h2>
										</div>

										<div
											className={cn(
												"mt-3 space-y-2 overflow-y-auto rounded-xl border border-border bg-muted p-2",
												mode === "r"
													? "h-[calc(80vh-140px)]"
													: "h-[calc(80vh-148px)]",
											)}
										>
											{reviews.length === 0 ? (
												<div className="flex flex-col items-center justify-center text-center font-sans text-muted-foreground">
													No reviews yet.
												</div>
											) : (
												reviews.map((review) => (
													<ReviewCard key={review.id} review={review} />
												))
											)}
										</div>
									</div>
								</AnimatedSplitSection>
							)}

							{/* Right side - Review Form */}
							{mode !== "r" && (
								<AnimatedSplitSection position="right" key={"w-review"}>
									<div
										className={cn(
											"flex h-full flex-col px-6",
											mode === "rw" ? "pt-16" : "pt-6",
										)}
									>
										<AnimatePresence>
											{mode === "w" && (
												<motion.div
													initial={{ opacity: 0 }}
													animate={{ opacity: 1 }}
													exit={{ opacity: 0 }}
												>
													<Button
														size="sm"
														variant={"secondary"}
														onClick={() => setMode("rw")}
														className="mb-6 flex items-center gap-2"
													>
														<ChevronLeft size={16} />
														<span>View all reviews</span>
													</Button>
												</motion.div>
											)}
										</AnimatePresence>
										<div className="flex-1 pb-6">
											<div className="w-full">
												<ReviewForm />
											</div>
										</div>
									</div>
								</AnimatedSplitSection>
							)}
						</AnimatePresence>
					</LayoutGroup>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default ReviewsDialog;
