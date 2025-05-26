import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CodeBlock from "./Codeblock";
import MarkdownImage from "./MarkdownImage";
import styles from "./markdown.module.css";
import preParse from "./pre-parse";
export default function MarkdownPreview({ markdown }: { markdown: string }) {
	const { cleanMarkdown, imagesMetadata } = preParse(markdown);
	console.log({ markdown, cleanMarkdown });
	let imageIndex = 0;

	return (
		<div className={cn(styles["markdown-preview"])}>
			<ReactMarkdown
				remarkPlugins={[remarkGfm]}
				components={{
					p: ({ children }) => {
						return <div className="my-6 leading-tight">{children}</div>;
					},
					img: () => {
						const metadata = imagesMetadata[imageIndex++];
						if (!metadata) return null;
						return (
							<MarkdownImage
								src={metadata.src}
								alt={metadata.alt}
								id={metadata.id}
								widthPercentage={metadata.width}
								index={imageIndex - 1}
								readonly={true}
							/>
						);
					},
					pre: ({
						className,
						children,
					}: {
						className?: string;
						children?: React.ReactNode;
					}) => <CodeBlock className={className}>{children}</CodeBlock>,
				}}
			>
				{cleanMarkdown}
			</ReactMarkdown>
		</div>
	);
}
