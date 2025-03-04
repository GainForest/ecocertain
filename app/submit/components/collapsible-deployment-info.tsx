import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Info } from "lucide-react";
import { DeploymentInfoBox } from "./deployment-info-box";

interface CollapsibleDeploymentInfoProps {
	isExpanded: boolean;
	onToggle: () => void;
	className?: string;
}

export const CollapsibleDeploymentInfo = ({
	isExpanded,
	onToggle,
	className,
}: CollapsibleDeploymentInfoProps) => {
	return (
		<div
			className={cn(
				"overflow-hidden rounded-b-3xl border border-border bg-background",
				className,
			)}
		>
			<Button
				type="button"
				variant="outline"
				className="w-full justify-between rounded-none border-none font-medium"
				onClick={onToggle}
			>
				<span className="flex items-center gap-2">
					<Info className="h-4 w-4 text-muted-foreground" />
					What happens after deployment?
				</span>
				<ChevronDown
					className={cn(
						"h-4 w-4 transition-transform duration-300 ease-in-out",
						isExpanded ? "rotate-180" : "",
					)}
				/>
			</Button>
			<AnimatePresence>
				{isExpanded && (
					<motion.div
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: "auto", opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{ duration: 0.3, ease: "easeInOut" }}
						className="overflow-hidden"
					>
						<DeploymentInfoBox className="w-full border-none" />
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};
