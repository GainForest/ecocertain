"use client";

import {
	BlockTypeSelect,
	BoldItalicUnderlineToggles,
	CreateLink,
	InsertTable,
	InsertThematicBreak,
	ListsToggle,
	MDXEditor,
	type MDXEditorMethods,
	type MDXEditorProps,
	Separator,
	UndoRedo,
	headingsPlugin,
	linkDialogPlugin,
	linkPlugin,
	listsPlugin,
	markdownShortcutPlugin,
	quotePlugin,
	tablePlugin,
	thematicBreakPlugin,
	toolbarPlugin,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";
import React, { useEffect, useState, type ForwardedRef } from "react";

function MarkdownEditor({
	editorRef,
	showToolbar = true,
	toolbarSize = "md",
	...props
}: { editorRef: ForwardedRef<MDXEditorMethods> | null } & MDXEditorProps & {
		showToolbar?: boolean;
		toolbarSize?: "sm" | "md";
	}) {
	const [isMounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!isMounted) return null;

	const customizedToolbarPlugin = () =>
		toolbarPlugin({
			toolbarContents: () => {
				return (
					<div className="flex flex-col">
						<div className="flex items-center">
							<UndoRedo />

							<Separator />

							<BoldItalicUnderlineToggles />

							{toolbarSize === "md" && (
								<>
									<Separator />

									<BlockTypeSelect />
								</>
							)}

							<Separator />

							<ListsToggle />

							<Separator />

							<CreateLink />

							{toolbarSize === "md" && (
								<>
									<InsertTable />

									<Separator />

									<InsertThematicBreak />
								</>
							)}
						</div>
					</div>
				);
			},
		});

	return (
		<MDXEditor
			contentEditableClassName="prose"
			plugins={[
				headingsPlugin(),
				listsPlugin(),
				quotePlugin(),
				linkPlugin(),
				linkDialogPlugin(),
				tablePlugin(),
				thematicBreakPlugin(),
				markdownShortcutPlugin(),
				...(showToolbar ? [customizedToolbarPlugin()] : []),
			]}
			{...props}
			ref={editorRef}
		/>
	);
}
export default MarkdownEditor;
