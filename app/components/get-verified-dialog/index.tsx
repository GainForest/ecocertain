import {
	Dialog,
	DialogCancel,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/modern-dialog-extended";
import type React from "react";
import Sidebar from "./sidebar";

const GetVerifiedDialog = ({
	hypercertId,
	trigger,
}: {
	hypercertId: string;
	trigger: React.ReactNode;
}) => {
	return (
		<Dialog>
			<DialogTrigger asChild>{trigger}</DialogTrigger>
			<DialogContent sidebarChildren={<Sidebar />}>
				<DialogHeader>
					<DialogTitle>Get Verified</DialogTitle>
					<DialogDescription>
						Apply for verification to access the verified badge.
					</DialogDescription>
				</DialogHeader>
				<div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-lg bg-muted p-4 text-center">
					<span className="font-bold text-lg">Coming Soon</span>
					<span className="text-muted-foreground text-sm">
						This feature is coming soon.
					</span>
				</div>
				<DialogFooter>
					<DialogCancel>Cancel</DialogCancel>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default GetVerifiedDialog;
