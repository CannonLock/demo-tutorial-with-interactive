"use client";

import { Box, Typography, useTheme } from "@mui/material";

/**
 * SVG depicting: You → Access Point → HTCondor → OSPool execution points,
 * with results flowing back.
 */
export default function WorkflowDiagram() {
	const theme = useTheme();
	const primary = theme.palette.primary.main;
	const secondary = theme.palette.secondary?.main ?? "#f57c00";
	const text = theme.palette.text.primary;
	const muted = theme.palette.text.secondary;

	return (
		<Box sx={{ my: 3 }}>
			<Box
				component="svg"
				viewBox="0 0 900 320"
				sx={{ width: "100%", height: "auto", display: "block" }}
				role="img"
				aria-label="OSPool workflow diagram"
			>
				<defs>
					<marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
						<path d="M 0 0 L 10 5 L 0 10 z" fill={primary} />
					</marker>
					<marker id="arrow-return" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
						<path d="M 0 0 L 10 5 L 0 10 z" fill={secondary} />
					</marker>
				</defs>

				{/* You */}
				<g>
					<circle cx="70" cy="160" r="42" fill={primary} opacity="0.12" />
					<circle cx="70" cy="140" r="14" fill={primary} />
					<path d="M 45 185 Q 70 158 95 185 L 95 195 L 45 195 Z" fill={primary} />
					<text x="70" y="225" textAnchor="middle" fill={text} fontSize="14" fontWeight="600">You</text>
					<text x="70" y="243" textAnchor="middle" fill={muted} fontSize="11">(ssh)</text>
				</g>

				{/* Access Point */}
				<g>
					<rect x="200" y="115" width="160" height="100" rx="10" fill="#fff" stroke={primary} strokeWidth="2" />
					<rect x="200" y="115" width="160" height="26" rx="10" fill={primary} />
					<text x="280" y="133" textAnchor="middle" fill="#fff" fontSize="13" fontWeight="700">Access Point</text>
					<text x="280" y="160" textAnchor="middle" fill={text} fontSize="12">ap40.uw.osg-htc.org</text>
					<text x="280" y="180" textAnchor="middle" fill={muted} fontSize="11">submit file + executable</text>
					<text x="280" y="198" textAnchor="middle" fill={muted} fontSize="11">condor_submit</text>
				</g>

				{/* HTCondor */}
				<g>
					<rect x="410" y="115" width="160" height="100" rx="10" fill="#fff" stroke={primary} strokeWidth="2" />
					<rect x="410" y="115" width="160" height="26" rx="10" fill={primary} />
					<text x="490" y="133" textAnchor="middle" fill="#fff" fontSize="13" fontWeight="700">HTCondor</text>
					<text x="490" y="160" textAnchor="middle" fill={text} fontSize="12">scheduler / queue</text>
					<text x="490" y="180" textAnchor="middle" fill={muted} fontSize="11">matches jobs to slots</text>
					<text x="490" y="198" textAnchor="middle" fill={muted} fontSize="11">condor_q to inspect</text>
				</g>

				{/* OSPool */}
				<g>
					<rect x="620" y="60" width="240" height="210" rx="14" fill={primary} opacity="0.06" stroke={primary} strokeDasharray="4 4" />
					<text x="740" y="80" textAnchor="middle" fill={primary} fontSize="13" fontWeight="700">Open Science Pool</text>
					{[
						{ x: 645, y: 100 }, { x: 735, y: 100 }, { x: 825, y: 100 },
						{ x: 645, y: 165 }, { x: 735, y: 165 }, { x: 825, y: 165 },
						{ x: 690, y: 220 }, { x: 780, y: 220 },
					].map((p, i) => (
						<g key={i}>
							<rect x={p.x - 18} y={p.y - 14} width="36" height="28" rx="4" fill="#fff" stroke={primary} />
							<rect x={p.x - 14} y={p.y - 10} width="28" height="14" fill={primary} opacity={0.4 + (i % 3) * 0.2} />
							<circle cx={p.x + 12} cy={p.y + 9} r="2" fill={primary} />
						</g>
					))}
					<text x="740" y="290" textAnchor="middle" fill={muted} fontSize="11">execution points (CPUs · memory · disk)</text>
				</g>

				<line x1="115" y1="160" x2="195" y2="160" stroke={primary} strokeWidth="2.5" markerEnd="url(#arrow)" />
				<line x1="360" y1="160" x2="405" y2="160" stroke={primary} strokeWidth="2.5" markerEnd="url(#arrow)" />
				<line x1="570" y1="160" x2="615" y2="160" stroke={primary} strokeWidth="2.5" markerEnd="url(#arrow)" />

				<path d="M 740 270 Q 740 305 490 305 Q 280 305 280 240" fill="none" stroke={secondary} strokeWidth="2.5" strokeDasharray="6 4" markerEnd="url(#arrow-return)" />
				<text x="490" y="298" textAnchor="middle" fill={secondary} fontSize="11" fontWeight="600">results: .out · .err · .log files</text>
			</Box>

			<Typography variant="caption" color="text.secondary" sx={{ display: "block", textAlign: "center", mt: 1 }}>
				You submit jobs from an Access Point. HTCondor schedules them onto execution points across the OSPool, then returns output back to your home directory.
			</Typography>
		</Box>
	);
}

