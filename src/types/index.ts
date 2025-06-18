export interface Analysis {
  questionId: string;
  question: string;
  answer: string;
  analysis: string;
}

export interface CompetencyImprovement {
  category: string;
  suggestions: string[];
}

export interface InterviewAnalysis {
  overallScore: number;
  overallEvaluation: string;
  competencyAnalysis: string;
  detailedAnalysis: Analysis[];
  improvementSuggestions: string[];
  competencyImprovements: CompetencyImprovement[];
}

export interface Message {
  id: string;
  type: 'user' | 'interviewer';
  content: string;
  timestamp: Date;
}

export interface Interview {
  id: string;
  date: string;
  duration: number;
  messages: Message[];
  analysis: InterviewAnalysis;
}

export interface Project {
  id: string;
  title: string;
  createdAt: string;
  lastModified: string;
  interviews: Interview[];
} 