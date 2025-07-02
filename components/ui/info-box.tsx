"use client";

import { X } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";

const InfoBox = ({ children }: { children: React.ReactNode }) => {
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		setIsVisible(true);
	}, []);

	if (!isVisible) return null;

	return (
		<div className="flex justify-center p-4">
			<div className="relative rounded-full border border-green-400 bg-green-100 bg-opacity-60 px-3 py-1 text-green-800">
				<button
					type="button"
					onClick={() => setIsVisible(false)}
					className="-translate-y-1/2 absolute top-1/2 right-1 transform rounded-full p-0.5 text-green-600 transition-colors hover:bg-green-200 hover:text-green-800"
					aria-label="Close info box"
				>
					<X size={12} />
				</button>

				<div className="flex items-center gap-2 pr-5">{children}</div>
			</div>
		</div>
	);
};

export default InfoBox;
