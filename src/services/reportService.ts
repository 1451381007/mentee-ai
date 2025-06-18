import { InterviewAnalysis, Analysis, CompetencyImprovement } from '../types';

export class ReportService {
  private static instance: ReportService;
  private analysisCache: Map<string, InterviewAnalysis> = new Map();

  private constructor() {}

  public static getInstance(): ReportService {
    if (!ReportService.instance) {
      ReportService.instance = new ReportService();
    }
    return ReportService.instance;
  }

  public async generateAnalysisReport(projectId: string, interviewId: string): Promise<InterviewAnalysis> {
    const cacheKey = `${projectId}-${interviewId}`;
    
    if (this.analysisCache.has(cacheKey)) {
      return this.analysisCache.get(cacheKey)!;
    }

    try {
      const response = await fetch(`/api/projects/${projectId}/interviews/${interviewId}/analysis`);
      if (!response.ok) {
        throw new Error('Failed to fetch analysis report');
      }

      const analysis: InterviewAnalysis = await response.json();
      this.analysisCache.set(cacheKey, analysis);
      return analysis;
    } catch (error) {
      console.error('Error generating analysis report:', error);
      throw error;
    }
  }

  public formatAnalysisReport(analysis: InterviewAnalysis): string {
    const sections: string[] = [];

    // 总体评分
    sections.push(this.formatOverallScore(analysis.overallScore));
    
    // 总体评价
    sections.push(this.formatOverallEvaluation(analysis.overallEvaluation));
    
    // 能力分析
    sections.push(this.formatCompetencyAnalysis(analysis.competencyAnalysis));
    
    // 详细分析
    sections.push(this.formatDetailedAnalysis(analysis.detailedAnalysis));
    
    // 改进建议
    sections.push(this.formatImprovementSuggestions(analysis.improvementSuggestions));
    
    // 能力提升建议
    sections.push(this.formatCompetencyImprovements(analysis.competencyImprovements));

    return sections.join('\n\n');
  }

  private formatOverallScore(score: number): string {
    return `## 总体评分\n${score}分`;
  }

  private formatOverallEvaluation(evaluation: string): string {
    return `## 总体评价\n${evaluation}`;
  }

  private formatCompetencyAnalysis(analysis: string): string {
    return `## 能力分析\n${analysis}`;
  }

  private formatDetailedAnalysis(analyses: Analysis[]): string {
    const formattedAnalyses = analyses.map((analysis: Analysis, index: number) => {
      return `### 问题 ${index + 1}\n` +
             `问题：${analysis.question}\n` +
             `回答：${analysis.answer}\n` +
             `分析：${analysis.analysis}`;
    });
    return `## 详细分析\n${formattedAnalyses.join('\n\n')}`;
  }

  private formatImprovementSuggestions(suggestions: string[]): string {
    const formattedSuggestions = suggestions.map((suggestion: string, index: number) => {
      return `${index + 1}. ${suggestion}`;
    });
    return `## 改进建议\n${formattedSuggestions.join('\n')}`;
  }

  private formatCompetencyImprovements(improvements: CompetencyImprovement[]): string {
    const formattedImprovements = improvements.map((improvement: CompetencyImprovement, index: number) => {
      const formattedSuggestions = improvement.suggestions.map((suggestion: string, idx: number) => {
        return `  ${idx + 1}. ${suggestion}`;
      });
      return `### ${improvement.category}\n${formattedSuggestions.join('\n')}`;
    });
    return `## 能力提升建议\n${formattedImprovements.join('\n\n')}`;
  }
} 