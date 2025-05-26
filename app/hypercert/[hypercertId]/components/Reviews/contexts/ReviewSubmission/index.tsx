import type { EASConfig } from "@/config/eas";
import type { JsonRpcSigner } from "ethers";
import { type Dispatch, createContext, useContext, useReducer } from "react";
import type { Review } from "../../types";
import { addReview } from "./utils";
// State types
type StatusType =
	| "idle"
	| "drafting"
	| "awaiting_signature"
	| "signing"
	| "submitting"
	| "success"
	| "error";

interface Status {
	type: StatusType;
	label: string;
}

interface ReviewSubmissionState {
	status: Status;
	pendingReview: {
		text: string;
	} | null;
}

// Action types
type ReviewSubmissionAction =
	| { type: "START_SIGNING" }
	| { type: "SIGNATURE_SUCCESS" }
	| { type: "SIGNATURE_REJECTED" }
	| { type: "START_SUBMISSION" }
	| { type: "SUBMISSION_SUCCESS" }
	| { type: "SUBMISSION_ERROR"; payload: string }
	| { type: "UPDATE_PENDING_REVIEW"; payload: string }
	| { type: "CLEAR_PENDING_REVIEW" }
	| { type: "CLEAR_ERROR" };

// Context type
interface ReviewSubmissionContextType {
	state: ReviewSubmissionState;
	dispatch: Dispatch<ReviewSubmissionAction>;
	// Helper functions
	submitReview: (
		hypercertId: string,
		easConfig: EASConfig,
		signer: JsonRpcSigner,
	) => Promise<void>;
	updatePendingReview: (text: string) => void;
	clearError: () => void;
}

// Initial state
export const initialState: ReviewSubmissionState = {
	status: {
		type: "idle",
		label: "Ready to start",
	},
	pendingReview: null,
};

// Reducer
export function reviewSubmissionReducer(
	state: ReviewSubmissionState,
	action: ReviewSubmissionAction,
): ReviewSubmissionState {
	console.log(action);
	switch (action.type) {
		case "START_SIGNING":
			return {
				...state,
				status: {
					type: "signing",
					label: "Please sign the transaction and wait for confirmation...",
				},
			};

		case "SUBMISSION_SUCCESS":
			return {
				...state,
				status: {
					type: "success",
					label: "Review submitted successfully!",
				},
			};

		case "SIGNATURE_REJECTED":
			return {
				...state,
				status: {
					type: "error",
					label: "Transaction was rejected by the user.",
				},
			};

		case "SUBMISSION_ERROR":
			return {
				...state,
				status: {
					type: "error",
					label: action.payload,
				},
			};

		case "UPDATE_PENDING_REVIEW":
			return {
				...state,
				status: {
					type: "drafting",
					label: "Writing review...",
				},
				pendingReview: {
					text: action.payload,
				},
			};

		case "CLEAR_PENDING_REVIEW":
			return {
				...state,
				status: {
					type: "idle",
					label: "Ready to start.",
				},
				pendingReview: null,
			};

		case "CLEAR_ERROR":
			return {
				...state,
				status: state.pendingReview
					? { type: "drafting", label: "Writing review..." }
					: { type: "idle", label: "Ready to start." },
			};

		default:
			return state;
	}
}

// Create context
export const ReviewSubmissionContext =
	createContext<ReviewSubmissionContextType | null>(null);

// Custom hook for using the context
export function useReviewSubmission() {
	const context = useContext(ReviewSubmissionContext);
	if (!context) {
		throw new Error(
			"useReviewSubmission must be used within a ReviewSubmissionProvider",
		);
	}
	return context;
}

// Helper function to create actions
export function createReviewSubmissionActions(
	dispatch: Dispatch<ReviewSubmissionAction>,
	state: ReviewSubmissionState,
) {
	return {
		async submitReview(
			hypercertId: string,
			easConfig: EASConfig,
			signer: JsonRpcSigner,
		) {
			// Input validation with proper error dispatching
			if (!hypercertId) {
				dispatch({
					type: "SUBMISSION_ERROR",
					payload: "Hypercert ID is required",
				});
				return;
			}

			if (!state.pendingReview?.text) {
				dispatch({
					type: "SUBMISSION_ERROR",
					payload: "Please enter your review before submitting",
				});
				return;
			}

			// Start the signing process
			dispatch({ type: "START_SIGNING" });

			try {
				// This will handle both signing and submission since it's a blockchain transaction
				const tx = await addReview(
					{
						review: state.pendingReview.text,
						hypercertId,
					},
					easConfig,
					signer,
				);

				// Wait for the transaction to be mined

				await tx.wait();
				dispatch({ type: "SUBMISSION_SUCCESS" });
			} catch (error) {
				// Handle signature rejection or errors
				console.error(error);
				if (
					error instanceof Error &&
					(error.message.includes("rejected") ||
						error.message.includes("user denied"))
				) {
					dispatch({ type: "SIGNATURE_REJECTED" });
				} else {
					dispatch({
						type: "SUBMISSION_ERROR",
						payload: "Failed to submit review",
					});
				}
			}
		},

		updatePendingReview(text: string) {
			dispatch({ type: "UPDATE_PENDING_REVIEW", payload: text });
		},

		clearError() {
			dispatch({ type: "CLEAR_ERROR" });
		},
	};
}

// Types for the provider props
export interface ReviewSubmissionProviderProps {
	children: React.ReactNode;
	onReviewSubmitted?: (review: Review) => void;
}

export function ReviewSubmissionProvider({
	children,
}: ReviewSubmissionProviderProps) {
	const [state, dispatch] = useReducer(reviewSubmissionReducer, initialState);
	const actions = createReviewSubmissionActions(dispatch, state);

	return (
		<ReviewSubmissionContext.Provider
			value={{
				state,
				dispatch,
				...actions,
			}}
		>
			{children}
		</ReviewSubmissionContext.Provider>
	);
}
