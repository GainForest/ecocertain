import { promises as fs } from "node:fs";
import path from "node:path";
import { graphqlEndpoint } from "@/config/hypercerts";
import { graphql } from "@/lib/graphql";
import graphQlrequest from "graphql-request";

const PLACEHOLDER_IMAGE_PATH = path.join(
	process.cwd(),
	"public",
	"assets",
	"media",
	"images",
	"ecocert-image-placeholder.jpg",
);

// GraphQL query to fetch the image metadata for a given hypercert ID
const IMAGE_QUERY = graphql(`
  query HypercertImage($hypercert_id: String!) {
    hypercerts(where: { hypercert_id: { eq: $hypercert_id } }) {
      data {
        metadata {
          image
        }
      }
    }
  }
`);

// Extract image data from a base64 string or a URL
async function getImageData(
	imageOrUrl: string,
): Promise<{ contentType: string; buffer: Buffer }> {
	if (imageOrUrl.startsWith("data:image")) {
		const [metadata, base64Data] = imageOrUrl.split(",");
		const contentType = metadata.split(";")[0].split(":")[1];
		const buffer = Buffer.from(base64Data, "base64");
		return { contentType, buffer };
	}

	if (imageOrUrl.startsWith("http")) {
		const response = await fetch(imageOrUrl);
		const blob = await response.blob();
		const buffer = Buffer.from(await blob.arrayBuffer());
		return { contentType: blob.type, buffer };
	}

	throw new Error("Invalid image data");
}

// Serve the placeholder image from disk
async function servePlaceholderImage() {
	const buffer = await fs.readFile(PLACEHOLDER_IMAGE_PATH);
	const contentType = "image/jpeg";
	return {
		contentType,
		buffer,
	};
}

// GET handler to fetch and return the image associated with the given hypercert ID
export async function getHypercertImage(
	hypercertId: string,
): Promise<{ contentType: string; buffer: Buffer }> {
	try {
		const headers = {
			"Cache-Control": "public, max-age=1800", // 30 minutes in seconds
		};
		const res = await graphQlrequest(
			graphqlEndpoint,
			IMAGE_QUERY,
			{
				hypercert_id: hypercertId,
			},
			headers,
		);
		const imageOrUrl = res.hypercerts.data?.[0]?.metadata?.image;

		// Use placeholder image if no image URL or data is found
		console.log("imageOrUrl", imageOrUrl);
		if (!imageOrUrl || imageOrUrl === "https://hypercerts.org/logo.png") {
			return servePlaceholderImage();
		}

		// Get image data or use placeholder image if data is invalid
		try {
			const { contentType, buffer } = await getImageData(imageOrUrl);
			return { contentType, buffer };
		} catch (error) {
			console.error(`Error parsing image data: ${error}`);
			return servePlaceholderImage();
		}
	} catch (error) {
		throw new Error(`Error fetching image metadata: ${error}`);
	}
}
