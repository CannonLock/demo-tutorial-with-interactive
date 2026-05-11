export interface QuizQuestion {
	id: string;
	prompt: string;
	choices: string[];
	correctIndex: number;
	explanation: string;
}

export interface Section {
	id: string;
	title: string;
	subtitle: string;
	minutes: number;
	quiz: QuizQuestion[];
}

