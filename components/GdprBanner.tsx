"use client";

import { Button } from "@/components/ui/button";
import { useGDPRConsent } from "@/contexts/consent";
import { useEffect, useState } from "react";

const GdprBanner = () => {
	const { hasConsented, accept } = useGDPRConsent();
	const [isVisible, setIsVisible] = useState(!hasConsented);

	useEffect(() => {
		setIsVisible(!hasConsented);
	}, [hasConsented]);

	if (!isVisible) {
		return null;
	}

	return (
		<div className="fixed inset-x-0 bottom-0 z-50 border-border border-t bg-background/95 backdrop-blur">
			<div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-6 py-4 text-sm md:flex-row md:items-center md:justify-between">
				<div>
					<p className="font-semibold text-foreground">
						This site uses telemetry cookies.
					</p>
					<p className="text-muted-foreground text-sm">
						We collect usage analytics (wallet connects, form steps, swap
						telemetry) to improve Ecocertain. Your data stays on our servers and
						is never sold. By continuing you agree to this processing.
					</p>
				</div>
				<div className="flex gap-3">
					<Button
						variant="secondary"
						className="shrink-0"
						onClick={() => {
							accept();
						}}
					>
						Accept
					</Button>
				</div>
			</div>
		</div>
	);
};

export default GdprBanner;
