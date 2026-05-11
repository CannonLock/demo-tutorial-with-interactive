"use client";

import {
	Box,
	Container,
	Paper,
	Typography,
	Stack,
	Chip,
	LinearProgress,
	Button,
	List,
	ListItemButton,
	ListItemText,
	ListItemIcon,
	Alert,
	Divider,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableRow,
	IconButton,
	Tooltip,
	useMediaQuery,
	useTheme,
	Drawer,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import MenuIcon from "@mui/icons-material/Menu";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useCallback, useEffect, useMemo, useState } from "react";

import CodeBlock from "./CodeBlock";
import Quiz from "./Quiz";
import WorkflowDiagram from "./WorkflowDiagram";
import SubmitFileBuilder from "./SubmitFileBuilder";
import TerminalDemo from "./TerminalDemo";
import { SECTIONS, FINAL_QUIZ } from "./sections";

const PROGRESS_KEY = "ospool-course:progress:v1";

interface Progress {
	completedSections: Record<string, { score: number; passedAt: number }>;
	finalScore?: number;
	finalPassedAt?: number;
}

function loadProgress(): Progress {
	if (typeof window === "undefined") return { completedSections: {} };
	try {
		const v = window.localStorage.getItem(PROGRESS_KEY);
		if (v) return JSON.parse(v);
	} catch { /* noop */ }
	return { completedSections: {} };
}

function saveProgress(p: Progress) {
	if (typeof window === "undefined") return;
	try { window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(p)); } catch { /* noop */ }
}

const HELLO_SH = `#!/bin/bash
#
# hello-ospool.sh
# My very first OSPool job
#
# print a 'hello' message to the job's terminal output:
echo "Hello OSPool from Job $1 running on \`whoami\`@\`hostname\`"
#
# keep this job running for a few minutes so you'll see it in the queue:
sleep 180
`;

const HELLO_SUB = `# hello-ospool.sub
# My very first HTCondor submit file

executable = hello-ospool.sh
arguments  = $(Process)

log    = hello-ospool_$(Cluster)_$(Process).log
error  = hello-ospool_$(Cluster)_$(Process).err
output = hello-ospool_$(Cluster)_$(Process).out

# Job Duration: Medium (<10 hrs) or Long (<20 hrs)
+JobDurationCategory = "Medium"

requirements   = (OSGVO_OS_STRING == "RHEL 9")
request_cpus   = 1
request_memory = 1GB
request_disk   = 5GB

# Run 3 instances of this job
queue 3
`;

const LOG_SNIPPET = `005 (36062145.000.000) 2023-04-14 12:36:09 Job terminated.
	(1) Normal termination (return value 0)

	Partitionable Resources :    Usage  Request  Allocated
	   Cpus                 :        0        1          1
	   Disk (KB)            :      118     1024 1810509281
	   Memory (MB)          :       54     1024       1024

	Job terminated of its own accord at 2023-04-14T17:36:09Z with exit-code 0.
`;

function SectionShell({
	section,
	index,
	total,
	progress,
	onComplete,
	onNext,
	onPrev,
	children,
}: {
	section: (typeof SECTIONS)[number];
	index: number;
	total: number;
	progress: Progress;
	onComplete: (id: string, passed: boolean, score: number) => void;
	onNext?: () => void;
	onPrev?: () => void;
	children: React.ReactNode;
}) {
	const done = !!progress.completedSections[section.id];
	return (
		<Paper
			id={section.id}
			elevation={0}
			sx={{
				p: { xs: 2.5, sm: 4 },
				mb: 4,
				borderRadius: 3,
				border: "1px solid",
				borderColor: "divider",
				scrollMarginTop: 16,
			}}
		>
			<Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "flex-start" }} spacing={1} sx={{ mb: 1 }}>
				<Box>
					<Typography variant="overline" color="primary" sx={{ fontWeight: 700, letterSpacing: 1 }}>
						Section {index + 1} of {total} · ~{section.minutes} min
					</Typography>
					<Typography variant="h4" component="h2" sx={{ fontWeight: 800, mt: 0.5 }}>
						{section.title}
					</Typography>
					<Typography variant="subtitle1" color="text.secondary" sx={{ mt: 0.5 }}>
						{section.subtitle}
					</Typography>
				</Box>
				{done && (
					<Chip icon={<CheckCircleIcon />} color="success" label="Completed" sx={{ fontWeight: 700 }} />
				)}
			</Stack>

			<Divider sx={{ my: 2.5 }} />

			{children}

			<Quiz
				title={`Quick check: ${section.title.replace(/^\d+\.\s*/, "")}`}
				questions={section.quiz}
				storageKey={`ospool-course:quiz:${section.id}`}
				onComplete={(passed, score) => onComplete(section.id, passed, score)}
				compact
			/>

			<Stack direction="row" justifyContent="space-between" sx={{ mt: 3 }}>
				<Button onClick={onPrev} disabled={!onPrev}>← Previous</Button>
				<Button variant="contained" onClick={onNext} disabled={!onNext} endIcon={<KeyboardArrowDownIcon />}>
					Next section
				</Button>
			</Stack>
		</Paper>
	);
}

export default function Course() {
	const theme = useTheme();
	const isWide = useMediaQuery(theme.breakpoints.up("lg"));
	const [progress, setProgress] = useState<Progress>(() => ({ completedSections: {} }));
	const [hydrated, setHydrated] = useState(false);
	const [drawerOpen, setDrawerOpen] = useState(false);

	useEffect(() => {
		setProgress(loadProgress());
		setHydrated(true);
	}, []);

	const handleSectionComplete = useCallback(
		(id: string, passed: boolean, score: number) => {
			if (!passed) return;
			setProgress((prev) => {
				if (prev.completedSections[id]) return prev;
				const next: Progress = {
					...prev,
					completedSections: {
						...prev.completedSections,
						[id]: { score, passedAt: Date.now() },
					},
				};
				saveProgress(next);
				return next;
			});
		},
		[],
	);

	const handleFinalComplete = useCallback((passed: boolean, score: number) => {
		setProgress((prev) => {
			const next: Progress = {
				...prev,
				finalScore: score,
				finalPassedAt: passed ? Date.now() : prev.finalPassedAt,
			};
			saveProgress(next);
			return next;
		});
	}, []);

	const completedCount = Object.keys(progress.completedSections).length;
	const totalSteps = SECTIONS.length + 1; // sections + final
	const doneSteps = completedCount + (progress.finalPassedAt ? 1 : 0);
	const pct = Math.round((doneSteps / totalSteps) * 100);

	const scrollTo = (id: string) => {
		document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
		setDrawerOpen(false);
	};

	const resetAll = () => {
		if (typeof window === "undefined") return;
		if (!window.confirm("Reset all course progress and quiz answers?")) return;
		const keys = Object.keys(window.localStorage).filter((k) => k.startsWith("ospool-course:"));
		keys.forEach((k) => window.localStorage.removeItem(k));
		setProgress({ completedSections: {} });
		window.location.reload();
	};

	const nav = (
		<Box sx={{ p: 2, width: { xs: 280, lg: "auto" } }}>
			<Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700 }}>
				Your progress
			</Typography>
			<Stack direction="row" alignItems="center" spacing={1.5} sx={{ mt: 0.5, mb: 1 }}>
				<Box sx={{ flex: 1 }}>
					<LinearProgress
						variant="determinate"
						value={hydrated ? pct : 0}
						sx={{ height: 8, borderRadius: 4 }}
					/>
				</Box>
				<Typography variant="body2" sx={{ fontWeight: 700, minWidth: 40, textAlign: "right" }}>
					{hydrated ? pct : 0}%
				</Typography>
			</Stack>
			<Typography variant="caption" color="text.secondary">
				{hydrated ? `${doneSteps} of ${totalSteps} completed` : "Loading…"}
			</Typography>

			<List dense sx={{ mt: 1 }}>
				{SECTIONS.map((s, i) => {
					const done = hydrated && !!progress.completedSections[s.id];
					return (
						<ListItemButton key={s.id} onClick={() => scrollTo(s.id)} sx={{ borderRadius: 1, mb: 0.25 }}>
							<ListItemIcon sx={{ minWidth: 32 }}>
								{done ? (
									<CheckCircleIcon fontSize="small" color="success" />
								) : (
									<RadioButtonUncheckedIcon fontSize="small" color="disabled" />
								)}
							</ListItemIcon>
							<ListItemText
								primary={s.title}
								secondary={`~${s.minutes} min`}
								primaryTypographyProps={{ fontSize: "0.88rem", fontWeight: done ? 700 : 500 }}
								secondaryTypographyProps={{ fontSize: "0.72rem" }}
							/>
							<Typography variant="caption" color="text.secondary">{i + 1}</Typography>
						</ListItemButton>
					);
				})}
				<ListItemButton onClick={() => scrollTo("final-quiz")} sx={{ borderRadius: 1, mt: 0.5, backgroundColor: "primary.50" }}>
					<ListItemIcon sx={{ minWidth: 32 }}>
						{hydrated && progress.finalPassedAt ? (
							<EmojiEventsIcon fontSize="small" sx={{ color: "warning.main" }} />
						) : (
							<EmojiEventsIcon fontSize="small" color="disabled" />
						)}
					</ListItemIcon>
					<ListItemText
						primary="Final Quiz"
						secondary="Comprehensive · 10 questions"
						primaryTypographyProps={{ fontSize: "0.88rem", fontWeight: 700 }}
						secondaryTypographyProps={{ fontSize: "0.72rem" }}
					/>
				</ListItemButton>
			</List>

			<Button startIcon={<RestartAltIcon />} size="small" onClick={resetAll} sx={{ mt: 1 }}>
				Reset progress
			</Button>
		</Box>
	);

	const goNext = (i: number) => () => scrollTo(i + 1 < SECTIONS.length ? SECTIONS[i + 1].id : "final-quiz");
	const goPrev = (i: number) => (i === 0 ? undefined : () => scrollTo(SECTIONS[i - 1].id));

	const sectionContent = useMemo(
		() => ({
			intro: (
				<>
					<Typography paragraph>
						Welcome! This single-page course will take you from <em>never having submitted a job</em> to confidently running
						batches on the <strong>Open Science Pool (OSPool)</strong> using <strong>HTCondor</strong>. Plan on about 45–60 minutes total — your
						progress is saved automatically in your browser, so you can come back later.
					</Typography>
					<Alert severity="info" sx={{ my: 2 }}>
						<strong>What is high-throughput computing (HTC)?</strong> Instead of one giant computation, HTC runs <em>many independent jobs in parallel</em> across many machines. This is what the OSPool is designed for.
					</Alert>
					<Typography variant="h6" sx={{ mt: 2, fontWeight: 700 }}>Key terminology</Typography>
					<Table size="small" sx={{ my: 2 }}>
						<TableHead>
							<TableRow>
								<TableCell><strong>Term</strong></TableCell>
								<TableCell><strong>Meaning</strong></TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							<TableRow>
								<TableCell><strong>Access Point</strong></TableCell>
								<TableCell>The machine you SSH into (e.g., <code>ap40.uw.osg-htc.org</code>). You stage data, scripts, and software here, then submit jobs from here.</TableCell>
							</TableRow>
							<TableRow>
								<TableCell><strong>HTCondor</strong></TableCell>
								<TableCell>The job scheduler. It decides when and where each of your jobs will run.</TableCell>
							</TableRow>
							<TableRow>
								<TableCell><strong>OSPool</strong></TableCell>
								<TableCell>The distributed set of execution points (CPUs, memory, disk) contributed by many organizations, on which your jobs actually run.</TableCell>
							</TableRow>
							<TableRow>
								<TableCell><strong>Job</strong></TableCell>
								<TableCell>A single execution of your script/program on one execution point.</TableCell>
							</TableRow>
							<TableRow>
								<TableCell><strong>Submit file</strong></TableCell>
								<TableCell>A small <code>.sub</code> text file that tells HTCondor what to run, with what resources, and how many times.</TableCell>
							</TableRow>
						</TableBody>
					</Table>
					<Typography paragraph>
						<strong>What this course covers:</strong> the OSPool workflow, writing an executable, writing a submit file,
						job duration categories, submitting and monitoring, reading results, and right-sizing resource requests for scale-up.
					</Typography>
				</>
			),
			workflow: (
				<>
					<Typography paragraph>
						Whenever you submit a job, the same three actors are involved: <strong>you</strong> (on an Access Point),
						<strong> HTCondor</strong> (the scheduler), and the <strong>OSPool</strong> (the execution points). Here's how they connect:
					</Typography>
					<WorkflowDiagram />
					<Typography variant="h6" sx={{ mt: 2, fontWeight: 700 }}>The 5-step loop</Typography>
					<Box component="ol" sx={{ pl: 3 }}>
						<li><strong>Prepare</strong> an executable script — the thing one job actually runs.</li>
						<li><strong>Describe</strong> the job(s) in a submit file (resources, how many, etc.).</li>
						<li><strong>Submit</strong> with <code>condor_submit</code>.</li>
						<li><strong>Monitor</strong> with <code>condor_q</code> / <code>condor_watch_q</code>.</li>
						<li><strong>Inspect</strong> the resulting <code>.out</code>, <code>.err</code>, and <code>.log</code> files.</li>
					</Box>
					<Alert severity="info" sx={{ my: 2 }}>
						Throughout this course we'll build the classic <strong>&ldquo;Hello OSPool&rdquo;</strong> example: a small script that prints a greeting,
						submitted as <strong>3 jobs in parallel</strong>.
					</Alert>
				</>
			),
			executable: (
				<>
					<Typography paragraph>
						The executable is the script HTCondor will run on each execution point. For our example, we use a small bash script. Each job
						will be passed a different number as its first argument (<code>$1</code>).
					</Typography>
					<CodeBlock code={HELLO_SH} filename="hello-ospool.sh" />
					<Alert severity="success" sx={{ my: 2 }}>
						<strong>What <code>$1</code> does:</strong> in bash, <code>$1</code> is the first positional argument. The submit file (next section) will pass
						HTCondor's per-job <code>$(Process)</code> number into <code>$1</code>, so job 0 prints &ldquo;Job 0&rdquo;, job 1 prints &ldquo;Job 1&rdquo;, etc.
					</Alert>
					<Typography paragraph>
						If you ran this locally, you'd just type:
					</Typography>
					<CodeBlock code={`$ chmod +x hello-ospool.sh
$ ./hello-ospool.sh 0
Hello OSPool from Job 0 running on alice@laptop`} />
					<Typography paragraph>
						But for OSPool, we never run the executable ourselves. HTCondor does it — on hardware we've never seen — once we hand it a submit file.
					</Typography>
				</>
			),
			"submit-file": (
				<>
					<Typography paragraph>
						The submit file is plain text. It tells HTCondor: <em>what</em> to run, <em>what arguments</em> to pass,
						<em> what resources</em> each job needs, <em>where</em> to write logs, and <em>how many</em> jobs to enqueue.
					</Typography>
					<CodeBlock code={HELLO_SUB} filename="hello-ospool.sub" />

					<Typography variant="h6" sx={{ mt: 3, fontWeight: 700 }}>Line-by-line</Typography>
					<Table size="small" sx={{ my: 2 }}>
						<TableHead>
							<TableRow><TableCell><strong>Line</strong></TableCell><TableCell><strong>Meaning</strong></TableCell></TableRow>
						</TableHead>
						<TableBody>
							<TableRow><TableCell><code>executable</code></TableCell><TableCell>The script HTCondor runs.</TableCell></TableRow>
							<TableRow><TableCell><code>arguments = $(Process)</code></TableCell><TableCell>Per-job arg. <code>$(Process)</code> is replaced with 0, 1, 2, … for each queued job.</TableCell></TableRow>
							<TableRow><TableCell><code>log / error / output</code></TableCell><TableCell>Files HTCondor writes to. <code>$(Cluster)</code> is the submission ID; <code>$(Process)</code> is the per-job number.</TableCell></TableRow>
							<TableRow><TableCell><code>+JobDurationCategory</code></TableCell><TableCell>Tells OSG how long this job is expected to run — see the next section.</TableCell></TableRow>
							<TableRow><TableCell><code>requirements</code></TableCell><TableCell>Constraints on the slot, e.g., OS version.</TableCell></TableRow>
							<TableRow><TableCell><code>request_cpus / memory / disk</code></TableCell><TableCell>What each job needs. HTCondor matches jobs to slots with at least this much.</TableCell></TableRow>
							<TableRow><TableCell><code>queue 3</code></TableCell><TableCell>Enqueue 3 jobs from this description.</TableCell></TableRow>
						</TableBody>
					</Table>

					<SubmitFileBuilder />
				</>
			),
			duration: (
				<>
					<Typography paragraph>
						The OSPool is a shared resource, and different organizations contribute different machines. By telling HTCondor your job's
						<strong> expected duration</strong>, you help it schedule longer jobs onto resources that are less likely to be interrupted, and shorter jobs
						onto more of the pool for higher throughput.
					</Typography>
					<Table size="small" sx={{ my: 2 }}>
						<TableHead>
							<TableRow>
								<TableCell><strong>JobDurationCategory</strong></TableCell>
								<TableCell><strong>Expected duration</strong></TableCell>
								<TableCell><strong>Maximum allowed</strong></TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							<TableRow><TableCell>Medium <em>(default)</em></TableCell><TableCell>&lt; 10 hrs</TableCell><TableCell>20 hrs</TableCell></TableRow>
							<TableRow><TableCell>Long</TableCell><TableCell>&lt; 20 hrs</TableCell><TableCell>40 hrs</TableCell></TableRow>
						</TableBody>
					</Table>

					<Alert severity="warning" sx={{ my: 2 }}>
						Jobs whose <em>single execution</em> exceeds the maximum allowed duration are placed on <strong>hold</strong>. Jobs that test as longer than 20 hours
						are not a good fit for the OSPool without <strong>self-checkpointing</strong>.
					</Alert>

					<Typography paragraph>
						Add the category anywhere before the final <code>queue</code> line:
					</Typography>
					<CodeBlock code={`+JobDurationCategory = "Long"`} />

					<Typography variant="h6" sx={{ mt: 2, fontWeight: 700 }}>Decision flow</Typography>
					<Box
						sx={{
							p: 2,
							my: 2,
							borderRadius: 2,
							border: "1px dashed",
							borderColor: "divider",
							display: "grid",
							gap: 1,
							fontSize: "0.9rem",
						}}
					>
						<div>📏 <strong>How long does one job take in a test?</strong></div>
						<div>↳ Under 10 hrs → <Chip size="small" label='+JobDurationCategory = "Medium"' /></div>
						<div>↳ 10–20 hrs → <Chip size="small" label='+JobDurationCategory = "Long"' /></div>
						<div>↳ Over 20 hrs → 🛑 Break into smaller jobs <em>or</em> implement self-checkpointing.</div>
					</Box>
				</>
			),
			"submit-monitor": (
				<>
					<Typography paragraph>
						With <code>hello-ospool.sh</code> and <code>hello-ospool.sub</code> in your home directory, submitting is one command:
					</Typography>
					<CodeBlock code={`[alice@ap40 ~]$ condor_submit hello-ospool.sub
Submitting job(s)...
3 job(s) submitted to cluster 36062145.`} />

					<Typography paragraph>
						HTCondor assigns a <strong>cluster ID</strong> (here <code>36062145</code>). Each of the 3 jobs has a unique <strong>process ID</strong>: 0, 1, 2.
						You can refer to a single job as <code>&lt;cluster&gt;.&lt;process&gt;</code>, e.g. <code>36062145.0</code>.
					</Typography>

					<Typography variant="h6" sx={{ fontWeight: 700, mt: 2 }}>Watch the queue</Typography>
					<TerminalDemo />

					<Typography variant="h6" sx={{ fontWeight: 700, mt: 2 }}>Handy monitoring commands</Typography>
					<Table size="small" sx={{ my: 2 }}>
						<TableHead><TableRow><TableCell><strong>Command</strong></TableCell><TableCell><strong>What it does</strong></TableCell></TableRow></TableHead>
						<TableBody>
							<TableRow><TableCell><code>condor_q</code></TableCell><TableCell>Show your jobs in the queue (grouped into batches by default).</TableCell></TableRow>
							<TableRow><TableCell><code>condor_q -nobatch</code></TableCell><TableCell>One row per job, not grouped.</TableCell></TableRow>
							<TableRow><TableCell><code>condor_q -hold</code></TableCell><TableCell>Only held jobs, with the reason they're on hold.</TableCell></TableRow>
							<TableRow><TableCell><code>condor_watch_q</code></TableCell><TableCell>Live-updating view of your jobs (Ctrl+C to exit).</TableCell></TableRow>
							<TableRow><TableCell><code>condor_rm 845638.0</code></TableCell><TableCell>Remove a specific job (you can also pass a cluster or username).</TableCell></TableRow>
						</TableBody>
					</Table>
				</>
			),
			results: (
				<>
					<Typography paragraph>
						Once your jobs finish, they leave the queue. In your home directory you'll find <code>.out</code>, <code>.err</code>, and <code>.log</code> files for
						each job — one set per process ID.
					</Typography>
					<CodeBlock code={`[alice@ap40 ~]$ ls -l
-rw-r--r-- alice  hello-ospool_36062145_0.err
-rw-r--r-- alice  hello-ospool_36062145_0.out
-rw-r--r-- alice  hello-ospool_36062145_0.log
-rw-r--r-- alice  hello-ospool_36062145_1.err
-rw-r--r-- alice  hello-ospool_36062145_1.out
-rw-r--r-- alice  hello-ospool_36062145_1.log
...`} />

					<Typography variant="h6" sx={{ mt: 2, fontWeight: 700 }}>What's in each file?</Typography>
					<Table size="small" sx={{ my: 2 }}>
						<TableHead><TableRow><TableCell><strong>File</strong></TableCell><TableCell><strong>Contents</strong></TableCell></TableRow></TableHead>
						<TableBody>
							<TableRow><TableCell><code>.out</code></TableCell><TableCell>Standard output of the job — anything your script <code>echo</code>'d or printed.</TableCell></TableRow>
							<TableRow><TableCell><code>.err</code></TableCell><TableCell>Standard error — usually empty for healthy jobs; check this first when debugging.</TableCell></TableRow>
							<TableRow><TableCell><code>.log</code></TableCell><TableCell>HTCondor's transaction log of the job: when it was submitted, started, finished, and how much CPU/memory/disk it used.</TableCell></TableRow>
						</TableBody>
					</Table>

					<Typography paragraph>The end of the <code>.log</code> file is gold for optimization:</Typography>
					<CodeBlock code={LOG_SNIPPET} filename="hello-ospool_36062145_0.log (excerpt)" />

					<Alert severity="info" sx={{ my: 2 }}>
						The <strong>Usage</strong> column is what your job <em>actually used</em>; <strong>Request</strong> is what you asked for in the submit file.
						If Usage ≪ Request, you can request less next time to match more slots. If Usage ≥ Request (memory especially), the job will go on hold.
					</Alert>
				</>
			),
			scaling: (
				<>
					<Typography paragraph>
						HTCondor's superpower is running <em>many</em> jobs at once. But submitting 10,000 untested jobs is a recipe for disaster.
						The professional workflow is: <strong>test small → measure → tune → scale up</strong>.
					</Typography>

					<Typography variant="h6" sx={{ fontWeight: 700, mt: 2 }}>The scale-up ladder</Typography>
					<Box
						sx={{
							my: 2, p: 2, borderRadius: 2,
							border: "1px solid", borderColor: "divider",
							display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(4, 1fr)" }, gap: 1.5,
						}}
					>
						{[
							{ n: "1", label: "Single test job", note: "Verify correctness & basic resources" },
							{ n: "3–10", label: "Small batch", note: "Confirm jobs don't conflict" },
							{ n: "100–1,000", label: "Mid-scale", note: "Catch rare failures & holds" },
							{ n: "10,000+", label: "Full scale", note: "Use max_idle if huge" },
						].map((s, i) => (
							<Box key={i} sx={{ p: 1.5, borderRadius: 1.5, backgroundColor: "primary.50", textAlign: "center" }}>
								<Typography variant="h5" sx={{ fontWeight: 800, color: "primary.main" }}>{s.n}</Typography>
								<Typography variant="body2" sx={{ fontWeight: 600 }}>{s.label}</Typography>
								<Typography variant="caption" color="text.secondary">{s.note}</Typography>
							</Box>
						))}
					</Box>

					<Typography variant="h6" sx={{ fontWeight: 700, mt: 2 }}>Right-sizing resource requests</Typography>
					<Box component="ul" sx={{ pl: 3 }}>
						<li><strong>CPUs:</strong> start with 1. More CPUs only help if your code is genuinely multi-threaded.</li>
						<li><strong>Memory:</strong> estimate from past runs or your laptop; if you don't know, request a bit extra for tests, then tighten using the log.</li>
						<li><strong>Disk:</strong> sum of inputs + outputs + standard out/err + any temp files. Decompress factors apply if files are zipped.</li>
					</Box>

					<Alert severity="success" sx={{ my: 2 }}>
						<strong>Quick way to harvest usage from many logs:</strong>
						<CodeBlock code={`grep "Disk (KB)"  my-job_*.log
grep "Memory (MB)" my-job_*.log`} />
					</Alert>

					<Typography variant="h6" sx={{ fontWeight: 700, mt: 2 }}>Data hygiene</Typography>
					<Box component="ul" sx={{ pl: 3 }}>
						<li>Files &gt; 1 GB belong in <code>/protected</code>, not <code>/home</code>.</li>
						<li>Clean up intermediate files inside your job so they aren't transferred back.</li>
						<li>For complex pipelines, look into <strong>DAGMan</strong> or <strong>Pegasus</strong>.</li>
					</Box>
				</>
			),
		}),
		[],
	);

	return (
		<Box sx={{ bgcolor: "background.default", minHeight: "100vh", pb: 6 }}>
			{/* Hero */}
			<Box
				sx={{
					backgroundImage: "linear-gradient(135deg, rgba(25,118,210,0.08), rgba(245,124,0,0.08))",
					borderBottom: "1px solid",
					borderColor: "divider",
					pt: { xs: 4, sm: 6 },
					pb: { xs: 4, sm: 5 },
				}}
			>
				<Container maxWidth="xl">
					<Chip label="Interactive Course" color="primary" size="small" sx={{ fontWeight: 700, mb: 1 }} />
					<Typography variant="h2" component="h1" sx={{ fontWeight: 900, lineHeight: 1.1 }}>
						Submit Your First Jobs to the OSPool
					</Typography>
					<Typography variant="h6" color="text.secondary" sx={{ mt: 1.5, maxWidth: 760 }}>
						A guided tour of HTCondor job submission — with code, diagrams, a live submit-file builder, a simulated terminal, and quizzes to lock in what you learn.
					</Typography>
					<Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: "wrap", gap: 1 }}>
						<Chip label={`${SECTIONS.length} sections`} variant="outlined" />
						<Chip label="Mini quiz after each section" variant="outlined" />
						<Chip label="10-question final exam" variant="outlined" />
						<Chip label="Progress saved in your browser" variant="outlined" />
					</Stack>

					<Box sx={{ mt: 3, maxWidth: 760 }}>
						<Stack direction="row" alignItems="center" spacing={2}>
							<Box sx={{ flex: 1 }}>
								<LinearProgress
									variant="determinate"
									value={hydrated ? pct : 0}
									sx={{ height: 10, borderRadius: 5 }}
								/>
							</Box>
							<Typography variant="body1" sx={{ fontWeight: 700 }}>
								{hydrated ? pct : 0}%
							</Typography>
						</Stack>
						<Typography variant="caption" color="text.secondary">
							{hydrated ? `${doneSteps} of ${totalSteps} milestones complete` : "Loading your progress…"}
						</Typography>
					</Box>

					{!isWide && (
						<Button startIcon={<MenuIcon />} onClick={() => setDrawerOpen(true)} sx={{ mt: 2 }} variant="outlined">
							Course outline
						</Button>
					)}
				</Container>
			</Box>

			<Container maxWidth="xl" sx={{ mt: 4 }}>
				<Box sx={{ display: { xs: "block", lg: "grid" }, gridTemplateColumns: "280px 1fr", gap: 4 }}>
					{isWide ? (
						<Box sx={{ position: "sticky", top: 16, alignSelf: "start", maxHeight: "calc(100vh - 32px)", overflowY: "auto" }}>
							<Paper variant="outlined" sx={{ borderRadius: 2 }}>{nav}</Paper>
						</Box>
					) : (
						<Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
							{nav}
						</Drawer>
					)}

					<Box sx={{ minWidth: 0 }}>
						{SECTIONS.map((s, i) => (
							<SectionShell
								key={s.id}
								section={s}
								index={i}
								total={SECTIONS.length}
								progress={progress}
								onComplete={handleSectionComplete}
								onNext={goNext(i)}
								onPrev={goPrev(i)}
							>
								{sectionContent[s.id as keyof typeof sectionContent]}
							</SectionShell>
						))}

						{/* Final quiz */}
						<Paper
							id="final-quiz"
							elevation={0}
							sx={{
								p: { xs: 2.5, sm: 4 },
								borderRadius: 3,
								border: "2px solid",
								borderColor: "primary.main",
								backgroundImage: "linear-gradient(135deg, rgba(25,118,210,0.05), rgba(245,124,0,0.05))",
								scrollMarginTop: 16,
							}}
						>
							<Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
								<EmojiEventsIcon sx={{ color: "warning.main", fontSize: 36 }} />
								<Box>
									<Typography variant="overline" color="primary" sx={{ fontWeight: 700, letterSpacing: 1 }}>
										Final Exam
									</Typography>
									<Typography variant="h4" component="h2" sx={{ fontWeight: 800 }}>
										Put it all together
									</Typography>
								</Box>
							</Stack>
							<Typography color="text.secondary" sx={{ mb: 2 }}>
								Ten questions covering everything from the workflow to scaling up. 70% to pass.
							</Typography>

							{hydrated && completedCount < SECTIONS.length && (
								<Alert severity="info" sx={{ mb: 2 }}>
									You can take the final quiz any time, but you'll do best after passing each section's quick check.
									So far: <strong>{completedCount} / {SECTIONS.length}</strong> sections complete.
								</Alert>
							)}

							<Quiz
								questions={FINAL_QUIZ}
								storageKey="ospool-course:final"
								title="Final HTCondor / OSPool exam"
								onComplete={handleFinalComplete}
								passingPct={70}
							/>

							{hydrated && progress.finalPassedAt && (
								<Alert severity="success" icon={<EmojiEventsIcon />} sx={{ mt: 2 }}>
									<strong>Congratulations!</strong> You completed the course on {new Date(progress.finalPassedAt).toLocaleDateString()}.
									You now have what you need to submit jobs to the OSPool. For the next step, see the {" "}
									<a href="https://portal.osg-htc.org/documentation/" target="_blank" rel="noreferrer">OSPool User Guides</a>{" "}
									and reach out at <a href="mailto:support@osg-htc.org">support@osg-htc.org</a> with questions.
								</Alert>
							)}
						</Paper>

						<Typography variant="caption" color="text.secondary" sx={{ display: "block", textAlign: "center", mt: 4 }}>
							Course content adapted from the OSG / CHTC workload-planning guides. Your progress lives in localStorage — clear it any time from the sidebar.
						</Typography>
					</Box>
				</Box>
			</Container>
		</Box>
	);
}

