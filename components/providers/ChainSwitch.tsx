"use client";
import useAccount from "@/hooks/use-account";
import { cn } from "@/lib/utils";
import { NetworkIcon } from "@web3icons/react";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useSwitchChain } from "wagmi";
import { Button } from "../ui/button";
import { useModal } from "../ui/modal/context";
import {
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalTitle,
} from "../ui/modal/modal";
import { ModalDescription } from "../ui/modal/modal";

export const ChainSwitchModalId = "chain-switch-modal-unstrict";

const ChainSwitchModalStrictId = "chain-switch-modal-strict";
export const ChainSwitchModal = ({ strict = false }: { strict?: boolean }) => {
	const { stack, hide, popModal } = useModal();
	const { chainId, isConnected } = useAccount();
	const { switchChain, chains, isPending, isError, reset, variables } =
		useSwitchChain();
	const isChainSupported = chains.some((chain) => chain.id === chainId);

	// New state for user-selected chain and error
	const [selectedChainId, setSelectedChainId] = useState<number | null>(null);
	const [switchError, setSwitchError] = useState<string | null>(null);

	const handleBackAndClose = () => {
		popModal();
		if (isOnlyModal) {
			hide();
		}
	};

	const handleSwitchChain = (targetChainId: number) => {
		setSelectedChainId(targetChainId);
		setSwitchError(null);
		switchChain(
			{ chainId: targetChainId },
			{
				onSuccess: () => {
					setSelectedChainId(null); // Success: clear selection
					setSwitchError(null);
				},
				onError: () => {
					setSwitchError("Failed to switch chain. Please try again.");
					setSelectedChainId(null); // Error: clear selection
					reset();
				},
			},
		);
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies(switchError, setSwitchError): switchError and setSwitchError should not trigger this side effect
	useEffect(() => {
		if (switchError && selectedChainId === null) {
			setSwitchError(null);
		}
	}, [selectedChainId]);

	// biome-ignore lint/correctness/useExhaustiveDependencies(handleBackAndClose): handleBackAndClose should not trigger this side effect
	useEffect(() => {
		if (!isConnected || chainId === undefined) {
			handleBackAndClose();
			return;
		}
		if (strict && isChainSupported) {
			handleBackAndClose();
		}
	}, [strict, isChainSupported, isConnected, chainId]);

	const isOnlyModal = stack.length === 1;

	return (
		<ModalContent dismissible={false} className="font-sans">
			<ModalHeader>
				<ModalTitle>Switch Chain</ModalTitle>
				<ModalDescription>
					Switch to a different chain to continue.
				</ModalDescription>
			</ModalHeader>

			{/* Content Starts */}
			<div className="grid grid-cols-2 gap-2">
				{chains.map((chain) => {
					const isCurrent = chain.id === chainId;
					const isSelected = selectedChainId === chain.id;
					const isDisabled =
						(selectedChainId !== null && !isSelected) || isPending;

					// Always use 'secondary' variant for all buttons
					let borderClass = "";
					let accentClass = "";

					if (isCurrent) {
						// Current chain: primary accent (use secondary + accent classes)
						accentClass = "border-primary ring-2 ring-primary";
					} else if (isSelected) {
						// User-selected: primary border only
						borderClass = "border-2 border-primary";
					}

					return (
						<Button
							key={chain.id}
							onClick={() => handleSwitchChain(chain.id)}
							variant="secondary"
							className={cn(
								"flex h-auto flex-col items-start p-2",
								borderClass,
								accentClass,
							)}
							disabled={isDisabled}
						>
							<div className="flex w-full items-center justify-between">
								<div>
									{isSelected && isPending && (
										<Loader2 className="size-4 animate-spin text-primary" />
									)}
								</div>
								<div className="flex h-8 w-8 items-center justify-center rounded-md bg-black/10 p-1 dark:bg-white/10">
									<NetworkIcon
										name={chain.name.toLowerCase()}
										variant={"mono"}
										className="text-neutral-600 dark:text-neutral-400"
									/>
								</div>
							</div>
							<span>{chain.name}</span>
						</Button>
					);
				})}
			</div>
			{/* Content Ends */}

			{switchError && (
				<div className="mt-2 text-destructive text-sm">{switchError}</div>
			)}

			{(strict && isChainSupported) ||
				(!strict && (
					<ModalFooter>
						<Button onClick={handleBackAndClose} variant="secondary">
							{isOnlyModal ? "Close" : "Back"}
						</Button>
					</ModalFooter>
				))}
		</ModalContent>
	);
};

const ChainSwitchProvider = ({ children }: { children: React.ReactNode }) => {
	const { chainId, isConnected } = useAccount();
	const { chains } = useSwitchChain();
	const isChainSupported = chains.some((chain) => chain.id === chainId);
	const { show, isOpen, stack, pushModalByVariant, popModal } = useModal();

	// biome-ignore lint/correctness/useExhaustiveDependencies(popModal,show,pushModalByVariant): popModal, show, pushModalByVariant should not trigger this side effect
	useEffect(() => {
		if (isChainSupported) return;
		if (!isConnected) return;
		if (chainId === undefined) return;
		let lastModalId: string | undefined;
		if (stack.length !== 0) {
			lastModalId = stack[stack.length - 1];
		} else {
			lastModalId = undefined;
		}

		if (lastModalId) {
			if (lastModalId === ChainSwitchModalId) {
				popModal();
				return;
			}
		}
		if (lastModalId !== ChainSwitchModalStrictId) {
			pushModalByVariant({
				id: ChainSwitchModalStrictId,
				content: <ChainSwitchModal strict={true} />,
			});
		}
		if (!isOpen) {
			show();
		}
	}, [isChainSupported, isConnected, chainId, isOpen, stack]);

	return children;
};

export default ChainSwitchProvider;
