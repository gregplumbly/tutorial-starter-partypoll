export type Poll = {
  title: string;
  targetNumber: number;
  options: string[];
  votes?: number[];
  score: number[];
  guesses: number[];
};
