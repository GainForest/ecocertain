import { catchError } from "@/app/utils";
import { Button } from "@/components/ui/button";
import {
	type Hypercert,
	fetchHypercerts,
} from "@/graphql/hypercerts/queries/hypercerts";
import type { ApiError } from "@/types/api";
import { CircleAlert, RotateCw } from "lucide-react";
import Link from "next/link";
import PageError from "../shared/PageError";
import { GridView } from "./grid-view";

export async function HypercertsGridWrapper() {
	const [error, hypercerts] = await catchError<Hypercert[], ApiError>(
		fetchHypercerts(),
	);

	if (error) return <PageError title="We couldn't load ecocerts." />;

	return <GridView hypercerts={hypercerts} />;
}
