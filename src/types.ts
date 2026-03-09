export interface UserState {
  xp: number;
  level: number;
  streak: number;
  completedLessons: string[];
  customLessons: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  topic: string;
  type: "vocabulary" | "grammar";
  level: string;
}
