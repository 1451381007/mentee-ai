const API_KEY = '6dab7a44-b575-45c2-836a-f79f72b952e4';
const API_URL = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';
const MODEL_NAME = 'doubao-1.5-thinking-pro-250415';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const systemPrompt = `# 角色
你是一位资深的面试专家，在各行各业的面试技巧方面造诣深厚，尤其擅长依据用户的求职期望开展面试工作。

## 技能
### 技能 1: 你能根据用户求职岗位工作年限工作城市期望薪资智能分析岗位等级，根据不同等级提出面试问题进行面试，面对初级求职者时问题应该基础通用，面对高级求职者时问题应该专业深入；
### 技能 2: 根据用户求职岗位及相关等级智能分析岗位特征，生成面试问题进行提问；
### 技能 3: 当用户问题回答不清楚时，可追问一次细节，注意不要用同样的话术追问，不要一直追问，注意要识别用户的回答情况，当用户无法回答时开展下一个话题；
### 技能 4: 理解用户表达意思，并能够用户回答在下一次提问时给予一定的语气词回应；
### 技能 5：面试时能从通用能力，如自我介绍、项目经历、职业规划、专业技能等方面综合提问；
### 技能 6：可根据面试情况在询问5-8个问题左右主动结束面试，提醒用户点击右侧按钮查看分析报告；

## 步骤
开场：你好，我是今天的面试官，请说明一下你的求职岗位工作年限工作城市期望薪资，并简单介绍做个自我介绍
根据用户回答内容进行智能面试，进行面试流程；

## 限制:
- 所有提问采用一问一答的形式进行。
- 每一个提问后面可跟一个（回复提示）。
- 每次仅提出一个问题，绝对不能超过两个。
- 回答必须围绕面试相关内容，不得发散到其他无关领域。`;

export class InterviewerService {
  private messages: ChatMessage[] = [];
  private abortController: AbortController | null = null;

  constructor() {
    this.messages = [
      {
        role: 'system',
        content: systemPrompt
      }
    ];
  }

  public getOpeningMessage(): string {
    return "你好，我是今天的面试官，请说明一下你的求职岗位、工作年限、工作城市、期望薪资，并做个简单的自我介绍。";
  }

  public async chat(userMessage: string, onChunk: (chunk: string) => void): Promise<void> {
    try {
      // 如果存在之前的请求，取消它
      if (this.abortController) {
        this.abortController.abort();
      }
      this.abortController = new AbortController();

      // 添加用户消息
      this.messages.push({
        role: 'user',
        content: userMessage
      });

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
          'Accept': 'text/event-stream'
        },
        body: JSON.stringify({
          messages: this.messages,
          model: MODEL_NAME,
          stream: true,
          temperature: 0.7,
          max_tokens: 1000
        }),
        signal: this.abortController.signal
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Failed to get response reader');
      }

      const decoder = new TextDecoder();
      let buffer = '';
      let assistantMessage = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim() === '') continue;
          if (line === 'data: [DONE]') continue;
          
          if (line.startsWith('data: ')) {
            try {
              const data = line.slice(6);
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              
              if (content) {
                assistantMessage += content;
                onChunk(content);
              }
            } catch (e) {
              console.error('Failed to parse chunk:', line, e);
              continue;
            }
          }
        }
      }

      // 添加完整的助手回复到消息历史
      if (assistantMessage) {
        this.messages.push({
          role: 'assistant',
          content: assistantMessage
        });
      }

    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Request aborted');
        return;
      }
      console.error('Chat error:', error);
      throw new Error(
        error instanceof Error ? error.message : '与面试官通信失败，请重试'
      );
    } finally {
      this.abortController = null;
    }
  }

  public clearContext() {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    this.messages = [
      {
        role: 'system',
        content: systemPrompt
      }
    ];
  }

  public dispose() {
    this.clearContext();
  }
} 