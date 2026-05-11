"use client";

import { Box, Button, Stack, Typography } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ReplayIcon from "@mui/icons-material/Replay";
import { useEffect, useRef, useState } from "react";

interface Step {
	prompt?: string;
	cmd?: string;
	output: string;
	delay?: number;
}

const SCRIPT: Step[] = [
	{
		prompt: "[alice@ap40 ~]$",
		cmd: "ls",
		output: "hello-ospool.sh  hello-ospool.sub",
		delay: 600,
	},
	{
		prompt: "[alice@ap40 ~]$",
		cmd: "condor_submit hello-ospool.sub",
		output: `Submitting job(s)...
3 job(s) submitted to cluster 36062145.`,
		delay: 1200,
	},
	{
		prompt: "[alice@ap40 ~]$",
		cmd: "condor_q",
		output: `-- Schedd: ap40.uw.osg-htc.org : <128.104.101.92:9618?... @ 04/14/23 15:33:00
OWNER     BATCH_NAME     SUBMITTED   DONE   RUN    IDLE  TOTAL JOB_IDS
alice ID: 36062145       4/14 12:31      _      _       3      3 36062145.0-2

3 jobs; 0 completed, 0 removed, 3 idle, 0 running, 0 held, 0 suspended`,
		delay: 1200,
	},
	{
		prompt: "[alice@ap40 ~]$",
		cmd: "condor_q",
		output: `-- Schedd: ap40.uw.osg-htc.org : <128.104.101.92:9618?... @ 04/14/23 15:34:30
OWNER     BATCH_NAME     SUBMITTED   DONE   RUN    IDLE  TOTAL JOB_IDS
alice ID: 36062145       4/14 12:31      _      2       1      3 36062145.0-2

3 jobs; 0 completed, 0 removed, 1 idle, 2 running, 0 held, 0 suspended`,
		delay: 1400,
	},
	{
		prompt: "[alice@ap40 ~]$",
		cmd: "condor_q",
		output: `-- Schedd: ap40.uw.osg-htc.org : <128.104.101.92:9618?... @ 04/14/23 15:37:14
OWNER     BATCH_NAME     SUBMITTED   DONE   RUN    IDLE  TOTAL JOB_IDS
alice ID: 36062145       4/14 12:31      3     _       _      3 36062145.0-2

3 jobs; 3 completed, 0 removed, 0 idle, 0 running, 0 held, 0 suspended`,
		delay: 1400,
	},
	{
		prompt: "[alice@ap40 ~]$",
		cmd: "cat hello-ospool_36062145_0.out",
		output: "Hello OSPool from Job 0 running on alice@e389.chtc.wisc.edu",
		delay: 800,
	},
];

export default function TerminalDemo() {
	const [step, setStep] = useState(-1);
	const [running, setRunning] = useState(false);
	const scrollRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!running) return;
		if (step >= SCRIPT.length - 1) {
			setRunning(false);
			return;
		}
		const next = step + 1;
		const t = setTimeout(() => setStep(next), SCRIPT[Math.max(next, 0)].delay ?? 800);
		return () => clearTimeout(t);
	}, [running, step]);

	useEffect(() => {
		scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
	}, [step]);

	const start = () => {
		setStep(-1);
		setRunning(true);
		setTimeout(() => setStep(0), 100);
	};

	const reset = () => {
		setRunning(false);
		setStep(-1);
	};

	return (
		<Box sx={{ my: 3 }}>
			<Stack direction="row" spacing={1} sx={{ mb: 1 }}>
				<Button
					variant="contained"
					startIcon={<PlayArrowIcon />}
					onClick={start}
					disabled={running}
					size="small"
				>
					{step >= 0 ? "Replay" : "Run the demo"}
				</Button>
				<Button startIcon={<ReplayIcon />} onClick={reset} size="small" disabled={step < 0}>
					Clear
				</Button>
				<Typography variant="caption" color="text.secondary" sx={{ alignSelf: "center" }}>
					Watch what happens when you submit jobs and poll the queue.
				</Typography>
			</Stack>

			<Box
				ref={scrollRef}
				sx={{
					backgroundColor: "#0d1117",
					color: "#e6edf3",
					borderRadius: 1.5,
					p: 2,
					fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
					fontSize: "0.82rem",
					lineHeight: 1.55,
					minHeight: 240,
					maxHeight: 360,
					overflowY: "auto",
					border: "1px solid #30363d",
				}}
			>
				{step < 0 && (
					<Box sx={{ color: "#7d8590" }}>
						# Press &quot;Run the demo&quot; to see a typical OSPool submission session.
					</Box>
				)}
				{SCRIPT.slice(0, step + 1).map((s, i) => (
					<Box key={i} sx={{ mb: 1 }}>
						<Box>
							<Box component="span" sx={{ color: "#7ee787" }}>
								{s.prompt}
							</Box>{" "}
							<Box component="span" sx={{ color: "#e6edf3" }}>{s.cmd}</Box>
						</Box>
						<Box component="pre" sx={{ m: 0, whiteSpace: "pre-wrap", color: "#c9d1d9" }}>
							{s.output}
						</Box>
					</Box>
				))}
				{running && step >= 0 && step < SCRIPT.length - 1 && (
					<Box component="span" sx={{ color: "#7ee787" }}>
						▌
					</Box>
				)}
			</Box>
		</Box>
	);
}

