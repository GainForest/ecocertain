"use client";
import { Button } from "@/components/ui/button";
import { useModal } from "@/components/ui/modal/context";
import React from "react";
import FeedbackForm from "../hypercert/[hypercertId]/components/PurchaseFlow/feedback-form";

const FeedbackButton = () => {
	const { pushModalByVariant, show } = useModal();
	return (
		<Button
			variant={"link"}
			className="h-4 px-1"
			onClick={() => {
				pushModalByVariant(
					{
						id: "feedback-form",
						content: <FeedbackForm subject={null} />,
					},
					true,
				);
				show();
			}}
		>
			Send Feedback
		</Button>
	);
};

export default FeedbackButton;
