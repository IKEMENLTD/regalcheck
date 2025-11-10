export type RiskLevel = 'high' | 'medium' | 'low';

export interface Risk {
  category: string;
  level: RiskLevel;
  title: string;
  description: string;
  quote: string;
  suggestion: string;
}

export interface AnalysisResult {
  score: number;
  risks: Risk[];
  summary: string;
}

export interface AnalyzeResponse {
  success: boolean;
  data?: AnalysisResult;
  error?: string;
}
