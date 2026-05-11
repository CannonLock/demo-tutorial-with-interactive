"use client";

import {
	Box,
	Paper,
	Typography,
	Button,
	Radio,
	RadioGroup,
	FormControlLabel,
	Alert,
	Stack,
	LinearProgress,
	Chip,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { useMemo, useState } from "react";
import { QuizQuestion } from "./types";

interface Props {
	title?: string;
	questions: QuizQuestion[];
	storageKey: string;
	onComplete?: (passed: boolean, score: number) => void;
	passingPct?: number;
	compact?: boolean;
}

interface SavedState {
	answers: Record<string, number>;
	submitted: boolean;
}

function load(key: string): SavedState {
	if (typeof window === "undefined") return { answers: {}, submitted: false };
	try {
		const v = window.localStorage.getItem(key);
		if (v) return JSON.parse(v);
	} catch { /* noop */ }
	return { answers: {}, submitted: false };
}

function save(key: string, s: SavedState) {
	if (typeof window === "undefined") return;
	try { window.localStorage.setItem(key, JSON.stringify(s)); } catch { /* noop */ }
}

export default function Quiz({ title, questions, storageKey, onComplete, passingPct = 70, compact }: Props) {
	const [state, setState] = useState<SavedState>(() => load(storageKey));

	const setAnswer = (qid: string, idx: number) => {
		if (state.submitted) return;
		const next = { ...state, answers: { ...state.answers, [qid]: idx } };
		setState(next);
		save(storageKey, next);
	};

	const correctCount = useMemo(
		() => questions.reduce((acc, q) => acc + (state.answers[q.id] === q.correctIndex ? 1 : 0), 0),
		[questions, state.answers],
	);
	const pct = Math.round((correctCount / questions.length) * 100);
	const passed = pct >= passingPct;
	const allAnswered = questions.every((q) => state.answers[q.id] !== undefined);

	const submit = () => {
		const next = { ...state, submitted: true };
		setState(next);
		save(storageKey, next);
		onComplete?.(pct >= passingPct, pct);
	};

	const reset = () => {
		const next: SavedState = { answers: {}, submitted: false };
		setState(next);
		save(storageKey, next);
	};

	return (
		<Paper
			elevation={0}
			sx={{
				p: { xs: 2, sm: 3 },
				my: 3,
				borderRadius: 2,
				border: "2px solid",
				borderColor: state.submitted ? (passed ? "success.main" : "warning.main") : "primary.main",
				backgroundColor: state.submitted ? (passed ? "success.50" : "warning.50") : "primary.50",
			}}
		>
			<Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1, flexWrap: "wrap", gap: 1 }}>
				<Typography variant={compact ? "h6" : "h5"} sx={{ fontWeight: 700 }}>
					{title ?? "Check your understanding"}
				</Typography>
				{state.submitted && (
					<Chip
						icon={passed ? <CheckCircleIcon /> : <CancelIcon />}
						label={`${correctCount} / ${questions.length} · ${pct}%`}
						color={passed ? "success" : "warning"}
						sx={{ fontWeight: 700 }}
					/>
				)}
			</Stack>

			<Stack spacing={2.5}>
				{questions.map((q, qi) => {
					const chosen = state.answers[q.id];
					const isCorrect = chosen === q.correctIndex;
					return (
						<Box key={q.id}>
							<Typography sx={{ fontWeight: 600, mb: 1 }}>
								{qi + 1}. {q.prompt}
							</Typography>
							<RadioGroup value={chosen ?? ""} onChange={(e) => setAnswer(q.id, Number(e.target.value))}>
								{q.choices.map((c, idx) => {
									let bg = "transparent";
									if (state.submitted) {
										if (idx === q.correctIndex) bg = "success.100";
										else if (idx === chosen) bg = "error.100";
									}
									return (
										<FormControlLabel
											key={idx}
											value={idx}
											disabled={state.submitted}
											sx={{
												m: 0, mb: 0.5, borderRadius: 1, px: 1,
												backgroundColor: bg, alignItems: "flex-start",
												"& .MuiFormControlLabel-label": { py: 0.75 },
											}}
											control={<Radio size="small" />}
											label={c}
										/>
									);
								})}
							</RadioGroup>
							{state.submitted && (
								<Alert severity={isCorrect ? "success" : "error"} sx={{ mt: 1 }} icon={isCorrect ? <CheckCircleIcon /> : <CancelIcon />}>
									<strong>{isCorrect ? "Correct! " : "Not quite. "}</strong>{q.explanation}
								</Alert>
							)}
						</Box>
					);
				})}
			</Stack>

			{!state.submitted ? (
				<Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }} sx={{ mt: 3 }}>
					<Button variant="contained" disabled={!allAnswered} onClick={submit}>Submit answers</Button>
					<Box sx={{ flex: 1, minWidth: 100 }}>
						<LinearProgress
							variant="determinate"
							value={(Object.keys(state.answers).length / questions.length) * 100}
							sx={{ height: 6, borderRadius: 3 }}
						/>
					</Box>
					<Typography variant="caption" color="text.secondary">
						{Object.keys(state.answers).length}/{questions.length} answered
					</Typography>
				</Stack>
			) : (
				<Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }} sx={{ mt: 3 }}>
					<Alert severity={passed ? "success" : "info"} sx={{ flex: 1 }}>
						{passed
							? "Nice work — you passed this check. You can keep going!"
							: `You need ${passingPct}% to pass. Review the section above and try again.`}
					</Alert>
					<Button startIcon={<RestartAltIcon />} onClick={reset} variant="outlined">Retry</Button>
				</Stack>
			)}
		</Paper>
	);
}

