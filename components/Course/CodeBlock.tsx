"use client";

import { Box, IconButton, Tooltip } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import { useState } from "react";

interface Props {
	code: string;
	language?: string;
	filename?: string;
}

export default function CodeBlock({ code, filename }: Props) {
	const [copied, setCopied] = useState(false);

	const copy = async () => {
		try {
			await navigator.clipboard.writeText(code);
			setCopied(true);
			setTimeout(() => setCopied(false), 1500);
		} catch {
			/* noop */
		}
	};

	return (
		<Box
			sx={{
				position: "relative",
				my: 2,
				borderRadius: 1.5,
				overflow: "hidden",
				border: "1px solid",
				borderColor: "divider",
				backgroundColor: "#0d1117",
				color: "#e6edf3",
				fontFamily:
					'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
			}}
		>
			{filename && (
				<Box
					sx={{
						px: 2,
						py: 0.75,
						fontSize: "0.8rem",
						backgroundColor: "#161b22",
						borderBottom: "1px solid #30363d",
						color: "#7d8590",
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
					}}
				>
					<span>{filename}</span>
				</Box>
			)}
			<Tooltip title={copied ? "Copied!" : "Copy"}>
				<IconButton
					size="small"
					onClick={copy}
					sx={{
						position: "absolute",
						top: filename ? 30 : 6,
						right: 6,
						color: "#7d8590",
						"&:hover": { color: "#e6edf3", backgroundColor: "#30363d" },
					}}
				>
					{copied ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
				</IconButton>
			</Tooltip>
			<Box
				component="pre"
				sx={{
					m: 0,
					p: 2,
					fontSize: "0.85rem",
					lineHeight: 1.55,
					overflowX: "auto",
					whiteSpace: "pre",
				}}
			>
				{code}
			</Box>
		</Box>
	);
}

