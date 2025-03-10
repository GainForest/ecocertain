"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, Copy } from "lucide-react";
import { useRef, useState } from "react";
const CodeBlock = ({
	className,
	children,
}: {
	className?: string;
	children: React.ReactNode;
}) => {
	const codeRef = useRef<HTMLPreElement>(null);
	const [copied, setCopied] = useState(false);

	const handleCopy = () => {
		const codeElement = codeRef.current;
		if (!codeElement) return;
		const code = codeElement.innerText;
		navigator.clipboard.writeText(code);
		setCopied(true);
		setTimeout(() => {
			setCopied(false);
		}, 2000);
	};

	return (
		<pre className={cn("group relative", className)}>
			<code ref={codeRef}>{children}</code>
			<Button
				variant="outline"
				size={"sm"}
				className="absolute top-2 right-2 opacity-0 group-hover:opacity-100"
				onClick={handleCopy}
				disabled={copied}
			>
				{copied ? <Check size={18} /> : <Copy size={18} />}
			</Button>
		</pre>
	);
};

export default CodeBlock;
