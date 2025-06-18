import { InterviewerService } from './interviewerService';

const API_KEY = '6dab7a44-b575-45c2-836a-f79f72b952e4';
const API_URL = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';
const MODEL_NAME = 'doubao-1.5-thinking-pro-250415';

export interface AnalysisResult {
  overallScore: number;          // 总分
  overallEvaluation: string;     // 整体评价
  competencyAnalysis: string;    // 能力分析
  detailedAnalysis: {           // 详细对话分析
    questionId: string;
    question: string;
    answer: string;
    analysis: string;
  }[];
  improvementSuggestions: string[]; // 改进建议
  competencyImprovements: {        // 能力提升建议
    category: string;
    suggestions: string[];
  }[];
}

export class AnalysisService {
  private interviewerService: InterviewerService;
  private abortController: AbortController | null = null;

  constructor() {
    this.interviewerService = new InterviewerService();
  }

  public async analyzeInterview(messages: any[]): Promise<AnalysisResult> {
    try {
      // 1. 生成分析提示词
      const analysisPrompt = this.generateAnalysisPrompt(messages);
      
      // 2. 调用大模型进行分析
      let analysisResponse = '';
      
      // 如果存在之前的请求，取消它
      if (this.abortController) {
        this.abortController.abort();
      }
      this.abortController = new AbortController();

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: `你是一位资深的面试专家，在各行各业的面试技巧方面造诣深厚，尤其擅长依据用户的求职期望开展面试工作。

你具备以下核心技能：
1. 根据用户求职岗位、工作年限、工作城市、期望薪资智能分析岗位等级，针对不同等级提出相应难度的问题
2. 根据用户求职岗位及相关等级智能分析岗位特征，生成针对性的面试问题
3. 当用户回答不清楚时，能适时追问一次细节，但不会重复追问或过度追问
4. 理解用户表达意思，并在下一次提问时给予适当的语气词回应
5. 从通用能力（如自我介绍、项目经历、职业规划、专业技能等）方面综合提问
6. 在询问5-8个问题后主动结束面试，提醒用户点击右侧按钮查看分析报告

请对面试过程进行全面分析和评估，确保分析客观、专业、有建设性。输出格式必须是合法的JSON格式，不要包含任何其他文本。`
            },
            {
              role: 'user',
              content: analysisPrompt
            }
          ],
          model: MODEL_NAME,
          stream: false,
          temperature: 0.7,
          max_tokens: 2000
        }),
        signal: this.abortController.signal
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      
      if (!data.choices?.[0]?.message?.content) {
        throw new Error('API响应格式不正确');
      }

      analysisResponse = data.choices[0].message.content;

      // 3. 解析响应结果
      return this.parseAnalysisResponse(analysisResponse);

    } catch (error) {
      console.error('Analysis error:', error);
      if (error instanceof Error) {
        throw new Error(`面试分析失败: ${error.message}`);
      }
      throw new Error('面试分析失败，请重试');
    } finally {
      this.abortController = null;
    }
  }

  private generateAnalysisPrompt(messages: any[]): string {
    // 过滤出面试对话（去掉系统消息）
    const conversationMessages = messages.filter(msg => msg.type === 'user' || msg.type === 'interviewer');
    
    // 将消息转换为对话格式
    const conversationText = conversationMessages
      .map((msg, index) => {
        const role = msg.type === 'user' ? '应聘者' : '面试官';
        const questionId = Math.floor(index / 2) + 1;
        return `${role} ${questionId}: ${msg.content}`;
      })
      .join('\n\n');

    return `请对以下面试对话进行全面分析和评估。要求：

1. 整体分析：
   - 给出百分制分数评价（考虑专业能力、沟通表达、问题解决、学习能力等维度）
   - 整体表现评价（优势和不足）
   - 按照专业能力、沟通能力、问题解决能力、学习能力等维度进行能力分析
   - 特别关注面试官的问题设计是否合理，追问是否恰当

2. 详细对话分析：
   - 逐一分析每个问答的优缺点
   - 指出回答中的亮点和不足
   - 给出改进建议
   - 评估面试官的问题设计是否符合应聘者的岗位等级和特征

3. 能力提升建议：
   - 针对面试中暴露的问题提供具体改进建议
   - 按能力维度提供提升建议
   - 建议要具体可行，符合应聘者的实际情况
   - 考虑应聘者的岗位等级和特征，提供针对性的提升方案

面试对话内容如下：
${conversationText}

请严格按照以下JSON格式输出分析结果（不要包含任何其他文本，确保JSON格式正确，特别注意数组和对象的格式）：
{
  "overallScore": 85,
  "overallEvaluation": "整体表现良好，沟通清晰，专业能力突出。",
  "competencyAnalysis": "在技术能力和问题解决方面表现优秀。",
  "detailedAnalysis": [
    {
      "questionId": "1",
      "question": "面试官问题",
      "answer": "应聘者回答",
      "analysis": "分析意见"
    }
  ],
  "improvementSuggestions": [
    "改进建议1",
    "改进建议2"
  ],
  "competencyImprovements": [
    {
      "category": "技术能力",
      "suggestions": [
        "具体建议1",
        "具体建议2"
      ]
    },
    {
      "category": "沟通能力",
      "suggestions": [
        "具体建议1",
        "具体建议2"
      ]
    }
  ]
}

注意：
1. 所有数组元素之间必须用逗号分隔
2. 数组的最后一个元素后面不能有逗号
3. 对象的最后一个属性后面不能有逗号
4. 确保所有字符串都用双引号包裹
5. 确保所有数组和对象都正确闭合
6. competencyImprovements 数组中的每个对象必须包含 category 和 suggestions 字段
7. suggestions 必须是一个字符串数组`;
  }

  private parseAnalysisResponse(response: string): AnalysisResult {
    try {
      // 清理响应文本，只保留JSON部分
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('未找到有效的JSON数据');
      }
      
      let jsonStr = jsonMatch[0];
      
      // 预处理JSON字符串
      jsonStr = jsonStr
        // 移除所有换行符和多余的空格
        .replace(/[\n\r\t]/g, ' ')
        .replace(/\s+/g, ' ')
        // 修复常见的JSON格式问题
        .replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)(\s*:)/g, '$1"$2"$3') // 确保属性名有引号
        .replace(/([{,]\s*)(true|false|null)(\s*[,}])/g, '$1"$2"$3') // 修复布尔值和null值
        .replace(/([{,]\s*)(\d+)(\s*[,}])/g, '$1$2$3') // 修复数字值
        .replace(/([{,]\s*)"([^"]*)"(\s*[,}])/g, '$1"$2"$3') // 修复字符串值
        .replace(/,(\s*[}\]])/g, '$1') // 移除多余的逗号
        .replace(/\}\s*\{/g, '},{') // 修复对象之间的分隔
        .replace(/\]\s*\[/g, '],[') // 修复数组之间的分隔
        .trim();

      // 尝试解析JSON
      let result;
      try {
        result = JSON.parse(jsonStr);
      } catch (error) {
        // 如果解析失败，尝试修复 competencyImprovements 数组
        const competencyMatch = jsonStr.match(/"competencyImprovements"\s*:\s*\[([\s\S]*?)\]/);
        if (competencyMatch) {
          const competencyStr = competencyMatch[1];
          // 修复 competencyImprovements 数组格式
          const fixedCompetencyStr = competencyStr
            .replace(/\}\s*\}\s*\]/g, '}]')
            .replace(/\}\s*\}\s*,\s*\{/g, '}},{')
            .replace(/\}\s*\}\s*\}\s*\]/g, '}]}')
            .replace(/\}\s*\}\s*\}\s*,\s*\{/g, '}}},{');
          
          jsonStr = jsonStr.replace(competencyMatch[0], `"competencyImprovements":[${fixedCompetencyStr}]`);
          
          try {
            result = JSON.parse(jsonStr);
          } catch (retryError) {
            console.error('JSON Parse Error after fix:', retryError);
            console.error('Problematic JSON:', jsonStr);
            throw new Error(`JSON解析失败: ${retryError instanceof Error ? retryError.message : '未知错误'}`);
          }
        } else {
          console.error('JSON Parse Error:', error);
          console.error('Problematic JSON:', jsonStr);
          throw new Error(`JSON解析失败: ${error instanceof Error ? error.message : '未知错误'}`);
        }
      }

      // 验证必要字段
      if (!result.overallScore || !result.overallEvaluation || !result.competencyAnalysis) {
        throw new Error('分析结果格式不正确：缺少必要字段');
      }

      // 确保所有必要字段都存在
      const defaultResult: AnalysisResult = {
        overallScore: 0,
        overallEvaluation: '',
        competencyAnalysis: '',
        detailedAnalysis: [],
        improvementSuggestions: [],
        competencyImprovements: []
      };

      const parsedResult = {
        ...defaultResult,
        ...result,
        // 确保数组字段至少是空数组
        detailedAnalysis: Array.isArray(result.detailedAnalysis) ? result.detailedAnalysis : [],
        improvementSuggestions: Array.isArray(result.improvementSuggestions) ? result.improvementSuggestions : [],
        competencyImprovements: Array.isArray(result.competencyImprovements) ? result.competencyImprovements : []
      };

      // 验证结果
      if (typeof parsedResult.overallScore !== 'number' || 
          parsedResult.overallScore < 0 || 
          parsedResult.overallScore > 100) {
        throw new Error('分数必须在0-100之间');
      }

      // 验证数组字段的格式
      if (!Array.isArray(parsedResult.detailedAnalysis) ||
          !Array.isArray(parsedResult.improvementSuggestions) ||
          !Array.isArray(parsedResult.competencyImprovements)) {
        throw new Error('数组字段格式不正确');
      }

      // 验证详细分析中的每个项目
      parsedResult.detailedAnalysis.forEach((item: {
        questionId: string;
        question: string;
        answer: string;
        analysis: string;
      }, index: number) => {
        if (!item.questionId || !item.question || !item.answer || !item.analysis) {
          throw new Error(`详细分析第${index + 1}项格式不正确`);
        }
      });

      // 验证能力提升建议中的每个项目
      parsedResult.competencyImprovements.forEach((item: {
        category: string;
        suggestions: string[];
      }, index: number) => {
        if (!item.category || !Array.isArray(item.suggestions)) {
          throw new Error(`能力提升建议第${index + 1}项格式不正确`);
        }
      });

      return parsedResult;
    } catch (error) {
      console.error('Error parsing analysis response:', error);
      if (error instanceof Error) {
        throw new Error(`分析结果解析失败: ${error.message}`);
      }
      throw new Error('分析结果解析失败');
    }
  }
} 