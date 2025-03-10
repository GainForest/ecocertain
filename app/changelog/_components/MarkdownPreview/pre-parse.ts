type ImageMetadata = {
	id: string;
	width: number;
	src: string;
	alt: string;
};

function generateId() {
	return btoa(Math.random().toString()).substring(0, 10);
}

const preParse = (markdown: string) => {
	const images: ImageMetadata[] = [];
	// Replace metadata with empty string while collecting metadata
	const cleanMarkdown = markdown.replace(
		/!\[(.*?)\]\((.*?)\)(?:\{([\w\-]+):(\d+)\})?/g,
		(match, alt, src, id, width) => {
			console.log(JSON.stringify({ alt, src, id, width }));
			images.push({
				id: id || generateId(),
				width: width ? Number.parseInt(width, 10) : 50,
				src: src,
				alt: alt || "",
			});

			return `![${alt}](${src})`;
		},
	);

	return { cleanMarkdown, imagesMetadata: images };
};

export default preParse;
