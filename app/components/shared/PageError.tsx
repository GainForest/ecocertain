"use client";

import { Button } from "@/components/ui/button";
import { CircleAlert, Home, RotateCw } from "lucide-react";
import Link from "next/link";
import React from "react";

const PageError = ({ title, body }: { title?: string; body?: string }) => {
	return (
		<section className="flex w-full flex-col items-center justify-center gap-2">
			<div className="w-full max-w-6xl p-8">
				<Link href={"/"}>
					<Button variant={"link"} className="gap-2 p-0">
						<Home size={20} /> Home
					</Button>
				</Link>
			</div>
			<div className="flex w-full max-w-6xl flex-col items-center px-8 pb-24 text-center md:pb-10">
				<CircleAlert className="mb-4 text-muted-foreground/75" size={60} />
				<p className="font-bold text-lg text-muted-foreground">
					{title ?? "We couldn't load this page."}
				</p>
				<p className="text-muted-foreground">
					{body ?? "Please try refreshing the page."}
				</p>
				<Button onClick={() => window.location.reload()} className="mt-4 gap-2">
					<RotateCw size={20} />
					Refresh
				</Button>
			</div>
		</section>
	);
};

export default PageError;
