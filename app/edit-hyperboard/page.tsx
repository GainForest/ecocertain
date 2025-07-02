import { hyperboardId } from "@/config/hypercerts";
import { fetchHyperboardById } from "@/graphql/hypercerts/queries/hyperboard";
import React from "react";
import EditHyperboardForm from "./EditHyperboardForm";

const EditHyperboardPage = async () => {
	const hyperboard = await fetchHyperboardById(hyperboardId);

	return (
		<div className="mx-auto max-w-6xl py-8">
			<h1 className="mb-8 font-baskerville text-4xl">Edit collection</h1>
			<EditHyperboardForm initialData={hyperboard} />
		</div>
	);
};

export default EditHyperboardPage;
