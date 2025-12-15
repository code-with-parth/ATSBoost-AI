export * from "./database";

export interface User {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
}

export interface Resume {
  id: string;
  userId: string;
  title: string;
  content: string;
  jobDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ResumeAnalysis {
  score: number;
  suggestions: string[];
  keywords: string[];
  improvements: string[];
}
