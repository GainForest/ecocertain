"use client";
import { Button } from "@/components/ui/button";
import React from "react";

const VerifiedStatus = () => {
	return (
		<>
			<div className="flex flex-col justify-between md:flex-row md:items-center">
				<Button className="md:min-w-48" disabled>
					Verification coming soon.
				</Button>
			</div>
		</>
	);
};

VerifiedStatus.displayName = "VerifiedStatus";

export { VerifiedStatus };
