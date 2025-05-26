export default function MarkdownImage({
	src,
	alt,
	id,
	widthPercentage,
	index,
	readonly,
}: {
	src: string;
	alt: string;
	id: string;
	widthPercentage: number;
	index: number;
	readonly: boolean;
}) {
	return (
		<div
			className="image-container flex w-full items-center justify-center"
			id={id}
			data-image-index={index}
		>
			<div
				className="group relative min-w-24 max-w-full overflow-hidden rounded-xl transition-colors hover:shadow-lg hover:ring-8 hover:ring-primary/10"
				style={{ width: `${widthPercentage}%` }}
			>
				<img src={src} alt={alt} className="h-auto w-full duration-200" />
			</div>
		</div>
	);
}
