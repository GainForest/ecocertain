"use client";
import { AnimatePresence, motion } from "framer-motion";
import { VisuallyHidden } from "radix-ui";
import {
	Fragment,
	createContext,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";
import { AnimateChangeInHeight } from "./AnimateChangeInHeight";
import ModalWrapper from "./ModalWrapper";
import {
	Dialog,
	DialogDescription,
	DialogHeader,
	DialogPlaceholder,
	DialogTitle,
} from "./dialog";
import {
	Drawer,
	DrawerDescription,
	DrawerHeader,
	DrawerPlaceholder,
	DrawerTitle,
} from "./drawer";
import { ModalDescription, ModalHeader, ModalTitle } from "./modal";
import useCurrentModalInfo from "./use-current-modal-info";
import useMediaQuery from "./use-media-query";

const VISIBILITY_TRANSITION_DURATION = 100;
const STACK_UPDATE_TRANSITION_DURATION = 300;
const SMALL_SCREEN_BREAKPOINT = "32rem";

export type ModalVariant = {
	id: string;
	content: React.ReactNode;
};

type ModalMode = "dialog" | "drawer";

type ModalContextType = {
	show: () => Promise<void>;
	hide: () => Promise<void>;
	onVisibilityChange: (open: boolean) => void;
	isOpen: boolean;
	mode: ModalMode | null;
	stack: Array<string>;
	pushModalByVariant: (variant: ModalVariant, replaceAll?: boolean) => void;
	popModal: () => void;
	clear: () => void;
};

const ModalContext = createContext<ModalContextType | null>(null);
export const ModalModeContext = createContext<ModalMode | null>(null);

const ModalStack = ({
	mode,
	children,
	isOpen,
	onOpenChange,
	dismissible,
}: {
	mode: ModalMode | null;
	children: React.ReactNode;
	dismissible: boolean;
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
}) => {
	if (mode === "dialog") {
		console.log("dismissible", dismissible);
		return (
			<Dialog open={isOpen} onOpenChange={onOpenChange}>
				<DialogPlaceholder
					className="overflow-hidden"
					onEscapeKeyDown={(e) => {
						e.preventDefault();
						dismissible && onOpenChange(false);
					}}
					onInteractOutside={(e) => {
						e.preventDefault();
						dismissible && onOpenChange(false);
					}}
				>
					<AnimateChangeInHeight className="relative">
						{children}
					</AnimateChangeInHeight>
				</DialogPlaceholder>
			</Dialog>
		);
	}
	if (mode === "drawer") {
		return (
			<Drawer
				open={isOpen}
				onOpenChange={onOpenChange}
				dismissible={dismissible}
			>
				<DrawerPlaceholder
					className="h-auto"
					onEscapeKeyDown={(e) => {
						e.preventDefault();
						dismissible && onOpenChange(false);
					}}
					onInteractOutside={(e) => {
						e.preventDefault();
						dismissible && onOpenChange(false);
					}}
				>
					<div className="max-h-[90vh] overflow-y-auto">
						<AnimateChangeInHeight className="relative">
							{children}
						</AnimateChangeInHeight>
					</div>
				</DrawerPlaceholder>
			</Drawer>
		);
	}
	return null;
};

export const ModalProvider = ({
	children,
	modalVariants,
}: {
	children: React.ReactNode;
	modalVariants: ModalVariant[];
}) => {
	const [modalIdStack, setModalIdStack] = useState<string[]>([]);
	const [modalStack, setModalStack] = useState<ModalVariant[]>([]);
	const [isOpen, setIsOpen] = useState(false);
	const smQueryMatches = useMediaQuery(
		`(min-width: ${SMALL_SCREEN_BREAKPOINT})`,
	);
	const mode =
		smQueryMatches === null ? null : smQueryMatches ? "dialog" : "drawer";

	const modalInfo = useCurrentModalInfo(modalIdStack);

	const show = () => {
		setIsOpen(true);
		return new Promise<void>((res) => {
			setTimeout(() => {
				res();
			}, VISIBILITY_TRANSITION_DURATION);
		});
	};

	const hide = () => {
		setIsOpen(false);
		return new Promise<void>((res) => {
			setTimeout(() => {
				res();
			}, VISIBILITY_TRANSITION_DURATION);
		});
	};

	const onVisibilityChange = (open: boolean) => {
		setIsOpen(open);
	};

	const pushModalByVariant = (variant: ModalVariant, replaceAll?: boolean) => {
		setModalIdStack((prev) => [...(replaceAll ? [] : prev), variant.id]);
		setModalStack((prev) => [...(replaceAll ? [] : prev), variant]);
	};

	const popModal = () => {
		setModalIdStack((prev) => prev.slice(0, -1));
		setModalStack((prev) => prev.slice(0, -1));
	};

	const clear = () => {
		setModalIdStack([]);
		setModalStack([]);
	};

	const handleOpenChange = (open: boolean) => {
		setIsOpen(open);
	};

	return (
		<ModalContext.Provider
			value={{
				show,
				hide,
				onVisibilityChange,
				isOpen,
				mode,
				stack: modalIdStack,
				pushModalByVariant,
				popModal,
				clear,
			}}
		>
			{children}
			<ModalModeContext.Provider value={mode}>
				<ModalStack
					mode={mode}
					isOpen={isOpen}
					onOpenChange={handleOpenChange}
					dismissible={modalInfo.dismissible}
				>
					<VisuallyHidden.Root>
						{mode === "dialog" ? (
							<DialogHeader>
								<DialogTitle>
									{typeof modalInfo.title === "string" ? (
										modalInfo.title
									) : (
										<>{modalInfo.title}</>
									)}
								</DialogTitle>
								<DialogDescription>
									{typeof modalInfo.description === "string" ? (
										modalInfo.description
									) : (
										<>{modalInfo.description}</>
									)}
								</DialogDescription>
							</DialogHeader>
						) : mode === "drawer" ? (
							<DrawerHeader>
								<DrawerTitle>
									{typeof modalInfo.title === "string" ? (
										modalInfo.title
									) : (
										<>{modalInfo.title}</>
									)}
								</DrawerTitle>
								<DrawerDescription>
									{typeof modalInfo.description === "string" ? (
										modalInfo.description
									) : (
										<>{modalInfo.description}</>
									)}
								</DrawerDescription>
							</DrawerHeader>
						) : null}
					</VisuallyHidden.Root>
					{modalStack.map((modal, index) => {
						const key = modal.id + index;
						return (
							<ModalWrapper
								index={index}
								transitionDurationInMs={STACK_UPDATE_TRANSITION_DURATION}
								modal={modal}
								isActive={modalStack.length - 1 === index}
								preventFocusTrap={mode === "drawer"}
								key={key}
							/>
						);
					})}
				</ModalStack>
			</ModalModeContext.Provider>
		</ModalContext.Provider>
	);
};

export const useModal = () => {
	const context = useContext(ModalContext);
	if (!context) {
		throw new Error("useModal must be used within a ModalProvider");
	}
	return context;
};
