import { QuizQuestion } from "./types";

export interface SectionMeta {
	id: string;
	title: string;
	subtitle: string;
	minutes: number;
	quiz: QuizQuestion[];
}

export const SECTIONS: SectionMeta[] = [
	{
		id: "intro",
		title: "1. Welcome to HTC on the OSPool",
		subtitle: "What HTCondor and the OSPool are, and why high-throughput computing matters.",
		minutes: 5,
		quiz: [
			{
				id: "intro-1",
				prompt: "Which best describes the Open Science Pool (OSPool)?",
				choices: [
					"A single supercomputer at one university.",
					"A distributed set of execution points contributed by many organizations.",
					"A cloud provider you pay per hour.",
					"A version of HTCondor used only for GPUs.",
				],
				correctIndex: 1,
				explanation:
					"The OSPool is composed of execution points contributed by many organizations. HTCondor schedules jobs across those distributed resources.",
			},
			{
				id: "intro-2",
				prompt: "What is the role of an Access Point?",
				choices: [
					"It runs the computation of your jobs.",
					"It is where you log in, stage data and software, and submit jobs from.",
					"It is a backup system for HTCondor logs.",
					"It is a website for browsing OSG results.",
				],
				correctIndex: 1,
				explanation:
					"You log in to an Access Point (e.g., ap40.uw.osg-htc.org) to stage data/scripts and run condor_submit. The jobs themselves run on execution points in the OSPool.",
			},
		],
	},
	{
		id: "workflow",
		title: "2. The OSPool Workflow",
		subtitle: "Trace a job from your terminal to an execution point and back.",
		minutes: 6,
		quiz: [
			{
				id: "wf-1",
				prompt: "In what order does a typical OSPool job flow?",
				choices: [
					"OSPool → HTCondor → Access Point → You",
					"You → Access Point → HTCondor → OSPool execution point → results back",
					"You → OSPool → HTCondor → Access Point",
					"HTCondor → You → Access Point → OSPool",
				],
				correctIndex: 1,
				explanation:
					"You write files on the Access Point, condor_submit hands the job to HTCondor, HTCondor matches it to an execution point in the OSPool, and the .out/.err/.log files are returned to your home directory.",
			},
			{
				id: "wf-2",
				prompt: "True or false: HTCondor decides when and where your job runs.",
				choices: ["True", "False"],
				correctIndex: 0,
				explanation:
					"You don't run the executable yourself. HTCondor matches each job to an available execution point that satisfies its requirements.",
			},
		],
	},
	{
		id: "executable",
		title: "3. Prepare Your Executable",
		subtitle: "Write a small script that does the work for one job.",
		minutes: 6,
		quiz: [
			{
				id: "exe-1",
				prompt: "In the hello-ospool.sh script, what does $1 refer to?",
				choices: [
					"The first line of the script.",
					"The first command-line argument passed to the script.",
					"The cluster ID assigned by HTCondor.",
					"The hostname of the execution point.",
				],
				correctIndex: 1,
				explanation:
					"$1 is bash's first positional argument. In the submit file we set arguments = $(Process), so HTCondor passes the job's process number into $1.",
			},
			{
				id: "exe-2",
				prompt: "Why does the example script include `sleep 180`?",
				choices: [
					"To make HTCondor pause before scheduling.",
					"To keep the job alive long enough to be visible in the queue.",
					"It is required for all OSPool jobs.",
					"To reserve disk space.",
				],
				correctIndex: 1,
				explanation:
					"The sleep keeps the job running for a few minutes so you can observe it with condor_q. Real jobs replace this with actual work.",
			},
		],
	},
	{
		id: "submit-file",
		title: "4. Write the Submit File",
		subtitle: "Tell HTCondor what to run, what resources it needs, and how many copies.",
		minutes: 10,
		quiz: [
			{
				id: "sub-1",
				prompt: "What does `queue 3` do at the bottom of a submit file?",
				choices: [
					"Reserves 3 slots in a priority queue.",
					"Submits 3 copies of the job; $(Process) will be 0, 1, 2.",
					"Limits HTCondor to 3 simultaneous users.",
					"Causes condor_q to refresh every 3 seconds.",
				],
				correctIndex: 1,
				explanation:
					"queue N tells HTCondor to enqueue N jobs from the same submit description. $(Process) is incremented for each.",
			},
			{
				id: "sub-2",
				prompt: "Which three resource requests must (or commonly should) appear in a submit file?",
				choices: [
					"request_gpu, request_network, request_user",
					"request_cpus, request_memory, request_disk",
					"request_speed, request_priority, request_timeout",
					"cpus = 1, memory = 1GB, disk = 5GB",
				],
				correctIndex: 1,
				explanation:
					"You request CPUs, memory, and disk so HTCondor can match your job to an execution slot with enough of each.",
			},
			{
				id: "sub-3",
				prompt: "What is $(Cluster) used for in log/output filenames?",
				choices: [
					"It is the index of the execution point.",
					"It is the cluster (submission) ID HTCondor assigns to a set of jobs.",
					"It is the number of CPUs requested.",
					"It is the OS string for the job.",
				],
				correctIndex: 1,
				explanation:
					"$(Cluster) is replaced with the cluster ID at submission time, so each batch of jobs gets uniquely-named log/error/output files.",
			},
		],
	},
	{
		id: "duration",
		title: "5. Job Duration Categories",
		subtitle: "Help OSG schedule efficiently by telling it how long jobs are expected to run.",
		minutes: 5,
		quiz: [
			{
				id: "dur-1",
				prompt: "Your jobs are expected to run ~14 hours. Which JobDurationCategory should you use?",
				choices: ["Medium", "Long", "Extra-Long", "None — duration isn't checked"],
				correctIndex: 1,
				explanation:
					"Medium is for expected runtimes < 10 hrs. Use Long for jobs expected to take up to 20 hrs.",
			},
			{
				id: "dur-2",
				prompt: "A job runs for 22 hours straight without checkpointing. What happens?",
				choices: [
					"HTCondor speeds it up automatically.",
					"It completes — there is no limit.",
					"It exceeds Medium's max (20 hrs) and is placed on hold.",
					"It is moved to a faster execution point.",
				],
				correctIndex: 2,
				explanation:
					"Jobs that run longer than their category's maximum allowed duration are placed on hold. Consider Long, breaking work into shorter pieces, or self-checkpointing.",
			},
			{
				id: "dur-3",
				prompt: "If you don't specify a JobDurationCategory, what is the default?",
				choices: ["Long", "Short", "Medium", "There is no default — submission fails"],
				correctIndex: 2,
				explanation:
					"Medium is the default category if none is specified.",
			},
		],
	},
	{
		id: "submit-monitor",
		title: "6. Submit and Monitor Jobs",
		subtitle: "Use condor_submit, condor_q, and condor_watch_q to drive your batch.",
		minutes: 7,
		quiz: [
			{
				id: "mon-1",
				prompt: "Which command actually submits your jobs to HTCondor?",
				choices: [
					"condor_run hello-ospool.sub",
					"condor_q hello-ospool.sub",
					"condor_submit hello-ospool.sub",
					"htcondor submit hello-ospool.sub",
				],
				correctIndex: 2,
				explanation:
					"`condor_submit <submit-file>` is the command that places jobs into the queue.",
			},
			{
				id: "mon-2",
				prompt: "Which command shows jobs one-per-line instead of grouped into batches?",
				choices: [
					"condor_q -nobatch",
					"condor_q -solo",
					"condor_q -all",
					"condor_q -verbose",
				],
				correctIndex: 0,
				explanation:
					"`condor_q -nobatch` lists each job on its own line. Use `condor_watch_q` for a live view.",
			},
			{
				id: "mon-3",
				prompt: "How do you remove the single job 845638.0?",
				choices: [
					"condor_kill 845638.0",
					"condor_rm 845638.0",
					"condor_q -remove 845638.0",
					"rm 845638.0",
				],
				correctIndex: 1,
				explanation:
					"`condor_rm <JobID>` removes a specific job. You can also pass a cluster ID or username.",
			},
		],
	},
	{
		id: "results",
		title: "7. Examine the Results",
		subtitle: "Read the .out, .err, and .log files to verify success and tune resources.",
		minutes: 6,
		quiz: [
			{
				id: "res-1",
				prompt: "Which file contains HTCondor's transaction history and a final resource usage table?",
				choices: [
					"The .out file",
					"The .err file",
					"The .log file",
					"The .sub file",
				],
				correctIndex: 2,
				explanation:
					"The .log file records job events and, on completion, shows Usage vs Request vs Allocated for CPU, memory, and disk.",
			},
			{
				id: "res-2",
				prompt: "In the log table below, what is the problem?\n\nCpus:  Usage 1  Request 1\nMemory(MB): Usage 6800 Request 1024",
				choices: [
					"Too many CPUs requested.",
					"The job used far more memory than it requested — it likely went on hold.",
					"The job used less disk than requested.",
					"Nothing is wrong.",
				],
				correctIndex: 1,
				explanation:
					"When a job uses more memory than requested, HTCondor will typically place it on hold. Use condor_q -hold to see the reason and re-submit with a higher request_memory.",
			},
		],
	},
	{
		id: "scaling",
		title: "8. Test, Optimize, and Scale Up",
		subtitle: "Right-size requests based on log data, then scale to your full batch.",
		minutes: 7,
		quiz: [
			{
				id: "sc-1",
				prompt: "Before submitting 10,000 jobs, what is the recommended first step?",
				choices: [
					"Submit all 10,000 at once and look at the failures.",
					"Submit 3–10 test jobs with small inputs and inspect the .log files.",
					"Email a facilitator to do it for you.",
					"Disable resource requests entirely.",
				],
				correctIndex: 1,
				explanation:
					"Always start with a few test jobs to verify correctness and learn real resource usage from the .log file before scaling up.",
			},
			{
				id: "sc-2",
				prompt: "Why is requesting too much memory a bad idea?",
				choices: [
					"It makes jobs slower.",
					"It costs money per GB.",
					"Jobs match fewer slots, reducing throughput.",
					"HTCondor will reject the submit file.",
				],
				correctIndex: 2,
				explanation:
					"Larger requests match fewer execution slots, so the same batch takes longer overall. Right-size requests based on real usage.",
			},
			{
				id: "sc-3",
				prompt: "Where should you put input/output files larger than ~1 GB?",
				choices: [
					"/home",
					"/tmp on the execution point",
					"/protected",
					"Inside the submit file",
				],
				correctIndex: 2,
				explanation:
					"For larger data, /protected provides more efficient transfer than /home.",
			},
		],
	},
];

export const FINAL_QUIZ: QuizQuestion[] = [
	{
		id: "f-1",
		prompt: "Which command submits a job description file to HTCondor?",
		choices: ["condor_run", "condor_submit", "condor_q", "condor_status"],
		correctIndex: 1,
		explanation: "condor_submit places the jobs described by a .sub file into the queue.",
	},
	{
		id: "f-2",
		prompt: "What is the role of an Access Point in the OSPool workflow?",
		choices: [
			"It executes the actual job computations.",
			"It is the login machine where you stage files and submit jobs.",
			"It is the OSG billing system.",
			"It stores all results forever.",
		],
		correctIndex: 1,
		explanation:
			"Access Points are where you log in, prepare files, and run condor_submit. Execution happens on OSPool execution points.",
	},
	{
		id: "f-3",
		prompt: "Which submit-file line submits 50 jobs with $(Process) running 0–49?",
		choices: ["queue 50", "submit 50", "run 50", "cluster 50"],
		correctIndex: 0,
		explanation: "`queue 50` enqueues 50 jobs from the same submit description.",
	},
	{
		id: "f-4",
		prompt: "Your single-execution job is expected to take ~25 hours on the OSPool. What should you do?",
		choices: [
			"Submit it with +JobDurationCategory = \"Long\" and hope it fits.",
			"Break the work into shorter jobs and/or implement self-checkpointing.",
			"Increase request_cpus to 32 so it finishes faster.",
			"Do nothing — there is no time limit.",
		],
		correctIndex: 1,
		explanation:
			"Single executions longer than 20 hours are not a good fit for the OSPool without self-checkpointing. Break the work up or checkpoint.",
	},
	{
		id: "f-5",
		prompt: "Where does HTCondor record a per-job resource usage summary?",
		choices: ["The .out file", "The .err file", "The .log file", "The .sub file"],
		correctIndex: 2,
		explanation: "The .log file includes the Usage / Request / Allocated table at job completion.",
	},
	{
		id: "f-6",
		prompt: "Which flag with condor_q shows only jobs that are on hold and why?",
		choices: ["-nobatch", "-hold", "-run", "-dag"],
		correctIndex: 1,
		explanation: "`condor_q -hold` lists held jobs and the hold reason.",
	},
	{
		id: "f-7",
		prompt: "Why should you request only the CPUs your software can actually use?",
		choices: [
			"More CPUs make jobs slower.",
			"Requesting more CPUs doesn't speed up single-threaded code, and it reduces the slots you can match.",
			"OSG charges per core.",
			"HTCondor will reject multi-CPU requests.",
		],
		correctIndex: 1,
		explanation:
			"Most software uses one core. Requesting more cores only reduces how many slots match your job, hurting throughput.",
	},
	{
		id: "f-8",
		prompt: "In the submit file, what does `arguments = $(Process)` do?",
		choices: [
			"Passes the cluster ID into the executable.",
			"Sets the working directory to the process number.",
			"Passes each job's process number (0, 1, 2, …) as the first argument to the executable.",
			"Tells HTCondor to spawn one process at a time.",
		],
		correctIndex: 2,
		explanation:
			"$(Process) is replaced per-job, so each job's executable gets a different positional argument — a common way to parameterize a batch.",
	},
	{
		id: "f-9",
		prompt: "Which is the best first step after your test jobs complete successfully?",
		choices: [
			"Immediately submit the full batch of 10,000 jobs.",
			"Use the resource usage in the .log file to right-size CPU/memory/disk requests.",
			"Delete the .log files so they don't take space.",
			"Switch to a different scheduler.",
		],
		correctIndex: 1,
		explanation:
			"Inspecting the log's Usage vs Request column lets you tune requests before scaling up, which improves throughput.",
	},
	{
		id: "f-10",
		prompt: "Which sequence correctly describes the end-to-end submission flow?",
		choices: [
			"Write executable → write submit file → condor_submit → condor_q → inspect .out/.err/.log",
			"condor_submit → write executable → condor_q → write submit file",
			"Write submit file → condor_q → condor_submit → write executable",
			"condor_q → condor_submit → condor_rm → write executable",
		],
		correctIndex: 0,
		explanation:
			"Prepare the executable and submit file, submit with condor_submit, monitor with condor_q, then examine the result files.",
	},
];

