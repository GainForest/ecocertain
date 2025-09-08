"use client";
import { useUserContext } from "@/components/providers/User";
import React from "react";

/**
 * Project terminology in the backend is used to refer to organizations in the frontend.
 */
const OrganizationsPage = () => {
	const { backend } = useUserContext();
	const organizations = backend?.projects;

	return <div>{JSON.stringify(organizations)}</div>;
};

export default OrganizationsPage;
