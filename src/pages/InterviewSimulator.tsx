import React, { useState, useRef, useEffect } from 'react';
import { Button, Input, Typography, Avatar, Modal, message, Space, Card, Progress, Timeline, Collapse, Alert, Divider, List, Tooltip } from 'antd';
import { SendOutlined, AudioOutlined, UserOutlined, RobotOutlined, SoundOutlined, PauseOutlined, FileTextOutlined, MessageOutlined, ToolOutlined, BulbOutlined, RiseOutlined, StarOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { InterviewerService } from '../services/interviewerService';
import { AnalysisService, AnalysisResult } from '../services/analysisService';

const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

// 接口定义
interface Message {
  id: string;
  type: 'user' | 'interviewer';
  content: string;
  timestamp: Date;
}

interface Interview {
  id: string;
  date: string;
  duration: number;
  messages: Message[];
  analysis: {
    overallScore: number;
    overallEvaluation: string;
    competencyAnalysis: string;
    detailedAnalysis: {
      questionId: string;
      question: string;
      answer: string;
      analysis: string;
    }[];
    improvementSuggestions: string[];
    competencyImprovements: {
      category: string;
      suggestions: string[];
    }[];
  };
}

interface Project {
  id: string;
  title: string;
  createdAt: string;
  lastModified: string;
  interviews: Interview[];
}

interface ProjectParams extends Record<string, string | undefined> {
  id?: string;
}

interface AnalysisModalProps {
  isVisible: boolean;
  onClose: () => void;
  messages: Message[];
}

// 声音识别接口
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: (event: Event) => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: (event: Event) => void;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

// CSS样式对象
const styles = {
  container: {
    height: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    position: 'relative' as const,
    overflow: 'hidden' as const,
    padding: '16px',
    boxSizing: 'border-box' as const,
    display: 'flex',
    flexDirection: 'column' as const,
  },
  starsLayer: {
    position: 'absolute' as const,
    width: '100%',
    height: '100%',
    top: '0',
    left: '0',
    zIndex: 0,
    background: `
      radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.1) 2px, transparent 2px),
      radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
      radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.08) 1.5px, transparent 1.5px)
    `,
    backgroundSize: '80px 80px, 120px 120px, 100px 100px',
    animation: 'float 20s ease-in-out infinite',
  },
  content: {
    position: 'relative' as const,
    zIndex: 1,
    maxWidth: '1400px',
    margin: '0 auto',
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
    boxSizing: 'border-box' as const,
    width: '100%',
    minHeight: 0,
  },
  header: {
    background: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '20px',
    padding: '20px 32px',
    textAlign: 'center' as const,
    flexShrink: 0,
    zIndex: 10,
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  },
  title: {
    color: '#ffffff',
    margin: 0,
    fontSize: '2rem',
    textShadow: '0 2px 20px rgba(0, 0, 0, 0.3)',
    fontWeight: '600',
    letterSpacing: '0.5px',
  },
  mainContent: {
    flex: 1,
    display: 'grid',
    gridTemplateColumns: '1fr 340px',
    gap: '16px',
    minHeight: 0,
    overflow: 'hidden',
  },
  chatPanel: {
    display: 'flex',
    flexDirection: 'column' as const,
    background: 'rgba(255, 255, 255, 0.12)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.18)',
    borderRadius: '24px',
    overflow: 'hidden',
    height: '100%',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
  },
  chatContainer: {
    flex: 1,
    padding: '24px',
    overflowY: 'auto' as const,
    scrollBehavior: 'smooth' as const,
    minHeight: 0,
  },
  inputArea: {
    padding: '20px 24px',
    borderTop: '1px solid rgba(255, 255, 255, 0.15)',
    background: 'rgba(255, 255, 255, 0.08)',
    flexShrink: 0,
    position: 'relative' as const,
  },
  inputWrapper: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-end',
    width: '100%',
  },
  textArea: {
    flex: 1,
    minHeight: '52px',
    maxHeight: '104px',
    background: 'rgba(255, 255, 255, 0.2)',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '16px',
    color: '#ffffff',
    resize: 'none' as const,
    fontSize: '15px',
    lineHeight: 1.5,
    padding: '12px 16px',
    transition: 'all 0.3s ease',
  },
  messageWrapper: {
    display: 'flex',
    alignItems: 'flex-start',
    marginBottom: '20px',
  },
  messageWrapperUser: {
    flexDirection: 'row-reverse' as const,
  },
  messageContent: {
    maxWidth: '75%',
    padding: '14px 20px',
    borderRadius: '20px',
    backdropFilter: 'blur(10px)',
    position: 'relative' as const,
    border: '1px solid rgba(255, 255, 255, 0.2)',
    wordWrap: 'break-word' as const,
    lineHeight: 1.6,
    fontSize: '14px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  },
  messageContentUser: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#ffffff',
    margin: '0 12px 0 0',
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  messageContentBot: {
    background: 'rgba(255, 255, 255, 0.95)',
    color: '#2d3748',
    margin: '0 0 0 12px',
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  avatar: {
    flexShrink: 0,
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
  },
  actionButton: {
    height: '52px',
    width: '52px',
    border: 'none',
    borderRadius: '16px',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
  },
  primaryButton: {
    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    color: '#ffffff',
  },
  secondaryButton: {
    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    color: '#ffffff',
  },
  recordingButton: {
    background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    animation: 'glow 2s ease-in-out infinite alternate',
    color: '#ffffff',
  },
  analysisPanel: {
    display: 'flex',
    flexDirection: 'column' as const,
    background: 'rgba(255, 255, 255, 0.12)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.18)',
    borderRadius: '24px',
    padding: '24px',
    height: '100%',
    overflow: 'hidden',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
  },
  analysisTitle: {
    color: '#ffffff',
    marginBottom: '16px',
    textAlign: 'center' as const,
    fontSize: '1.3rem',
    fontWeight: '600',
    textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
  },
  analysisContent: {
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 1.6,
    flex: 1,
    overflowY: 'auto' as const,
    marginBottom: '16px',
    fontSize: '0.9rem',
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
    padding: '16px',
  },
  analysisButton: {
    flexShrink: 0,
    height: '44px',
    background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    border: 'none',
    borderRadius: '12px',
    color: '#2d3748',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
  },
  // 响应式样式
  mobileLayout: {
    gridTemplateColumns: '1fr',
    gridTemplateRows: '1fr 320px',
  },
  mobileAnalysisPanel: {
    height: '320px',
    maxHeight: '320px',
  },
  // 录音状态提示
  recordingIndicator: {
    position: 'absolute' as const,
    top: '-50px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    color: '#ffffff',
    padding: '10px 20px',
    borderRadius: '25px',
    fontSize: '12px',
    fontWeight: '600',
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    whiteSpace: 'nowrap' as const,
    boxShadow: '0 6px 24px rgba(0, 0, 0, 0.2)',
    animation: 'bounce 1s ease-in-out infinite',
  },
};

// CSS样式表
const styleSheet = `
  @keyframes float {
    0%, 100% {
      transform: translateY(0px) rotate(0deg);
    }
    33% {
      transform: translateY(-10px) rotate(1deg);
    }
    66% {
      transform: translateY(5px) rotate(-1deg);
    }
  }

  @keyframes glow {
    from {
      box-shadow: 0 4px 20px rgba(250, 112, 154, 0.4);
    }
    to {
      box-shadow: 0 6px 30px rgba(254, 225, 64, 0.6);
    }
  }

  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% {
      transform: translateX(-50%) translateY(0);
    }
    40% {
      transform: translateX(-50%) translateY(-5px);
    }
    60% {
      transform: translateX(-50%) translateY(-3px);
    }
  }

  .chat-scrollbar::-webkit-scrollbar {
    width: 8px;
  }

  .chat-scrollbar::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
  }

  .chat-scrollbar::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 10px;
  }

  .chat-scrollbar::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
  }

  .interview-textarea {
    background: rgba(255, 255, 255, 0.2) !important;
    border: 2px solid rgba(255, 255, 255, 0.3) !important;
    color: #ffffff !important;
  }

  .interview-textarea::placeholder {
    color: rgba(255, 255, 255, 0.7) !important;
  }

  .interview-textarea:focus {
    border-color: rgba(255, 255, 255, 0.6) !important;
    box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1) !important;
    outline: none !important;
  }

  .message-arrow-user::before {
    content: '';
    position: absolute;
    top: 16px;
    right: -8px;
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 8px 0 8px 8px;
    border-color: transparent transparent transparent #667eea;
  }

  .message-arrow-bot::before {
    content: '';
    position: absolute;
    top: 16px;
    left: -8px;
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 8px 8px 8px 0;
    border-color: transparent rgba(255, 255, 255, 0.95) transparent transparent;
  }

  .action-button:hover {
    transform: translateY(-2px) scale(1.05);
  }

  .analysis-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.2);
  }

  /* 响应式布局 */
  @media (max-width: 1024px) {
    .container {
      height: 100vh !important;
      overflow: hidden !important;
      padding: 12px !important;
      display: flex !important;
      flex-direction: column !important;
    }
    
    .content {
      flex: 1 !important;
      gap: 12px !important;
      min-height: 0 !important;
    }
    
    .header {
      padding: 16px 24px !important;
    }
    
    .title {
      font-size: 1.6rem !important;
    }
    
    .main-content {
      grid-template-columns: 1fr !important;
      grid-template-rows: 1fr 320px !important;
      min-height: 0 !important;
      overflow: hidden !important;
      gap: 12px !important;
    }
    
    .analysis-panel {
      height: 320px !important;
      max-height: 320px !important;
      padding: 20px !important;
    }

    .chat-panel {
      min-height: 0 !important;
      height: 100% !important;
    }

    .chat-container {
      padding: 20px !important;
    }

    .input-area {
      padding: 16px 20px !important;
    }
  }

  @media (max-width: 768px) {
    .container {
      padding: 10px !important;
      height: 100vh !important;
      overflow: hidden !important;
      display: flex !important;
      flex-direction: column !important;
    }
    
    .content {
      gap: 10px !important;
      flex: 1 !important;
      min-height: 0 !important;
    }
    
    .header {
      padding: 12px 20px !important;
      border-radius: 16px !important;
    }
    
    .title {
      font-size: 1.4rem !important;
    }
    
    .main-content {
      grid-template-rows: 1fr 280px !important;
      gap: 10px !important;
      min-height: 0 !important;
      overflow: hidden !important;
    }
    
    .chat-panel {
      border-radius: 20px !important;
      min-height: 0 !important;
      height: 100% !important;
    }
    
    .analysis-panel {
      border-radius: 20px !important;
      padding: 16px !important;
      height: 280px !important;
      max-height: 280px !important;
    }

    .chat-container {
      padding: 16px !important;
    }

    .input-area {
      padding: 14px 16px !important;
    }

    .message-wrapper {
      margin-bottom: 16px !important;
    }

    .message-content {
      padding: 12px 16px !important;
      font-size: 13px !important;
      border-radius: 16px !important;
    }

    .action-button {
      height: 48px !important;
      width: 48px !important;
      border-radius: 14px !important;
    }

    .text-area {
      min-height: 48px !important;
      max-height: 96px !important;
      border-radius: 14px !important;
    }
  }

  @media (max-width: 480px) {
    .container {
      padding: 8px !important;
      height: 100vh !important;
      overflow: hidden !important;
      display: flex !important;
      flex-direction: column !important;
    }

    .content {
      gap: 8px !important;
      flex: 1 !important;
      min-height: 0 !important;
    }

    .main-content {
      gap: 8px !important;
      min-height: 0 !important;
      overflow: hidden !important;
      grid-template-rows: 1fr 240px !important;
    }

    .input-wrapper {
      flex-direction: column !important;
      gap: 8px !important;
    }
    
    .action-button {
      width: 100% !important;
      height: 44px !important;
      border-radius: 12px !important;
    }
    
    .message-content {
      max-width: 85% !important;
      font-size: 12px !important;
      padding: 10px 14px !important;
      line-height: 1.5 !important;
      border-radius: 14px !important;
    }

    .chat-panel {
      min-height: 0 !important;
      height: 100% !important;
      border-radius: 16px !important;
    }

    .analysis-panel {
      height: 240px !important;
      max-height: 240px !important;
      padding: 12px !important;
      border-radius: 16px !important;
    }

    .header {
      padding: 10px 16px !important;
      border-radius: 14px !important;
    }

    .title {
      font-size: 1.2rem !important;
    }

    .chat-container {
      padding: 12px !important;
    }

    .input-area {
      padding: 12px !important;
    }

    .text-area {
      min-height: 44px !important;
      max-height: 88px !important;
      font-size: 14px !important;
      border-radius: 12px !important;
    }

    .message-wrapper {
      margin-bottom: 12px !important;
    }

    .analysis-title {
      font-size: 1.1rem !important;
      margin-bottom: 12px !important;
    }

    .analysis-content {
      font-size: 0.8rem !important;
      margin-bottom: 12px !important;
      padding: 12px !important;
      border-radius: 10px !important;
    }

    .analysis-button {
      height: 40px !important;
      font-size: 13px !important;
      border-radius: 10px !important;
    }
  }
`;

const AnalysisModal: React.FC<AnalysisModalProps> = ({ isVisible, onClose, messages }) => {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overall');
  const analysisService = useRef(new AnalysisService());

  useEffect(() => {
    if (isVisible) {
      setIsLoading(true);
      // 使用AnalysisService生成真实的分析报告
      analysisService.current.analyzeInterview(messages)
        .then(result => {
          setAnalysis(result);
        })
        .catch(error => {
          console.error('分析生成失败:', error);
          message.error('分析报告生成失败，请重试');
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isVisible, messages]);

  return (
    <Modal
      title={
        <div style={{ textAlign: 'center', fontSize: '18px', fontWeight: 'bold' }}>
          📋 面试分析报告
        </div>
      }
      open={isVisible}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose} size="large">
          关闭报告
        </Button>
      ]}
      width={800}
      centered
      styles={{
        body: { maxHeight: '70vh', overflowY: 'auto' }
      }}
    >
      {isLoading ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px 20px',
          background: 'linear-gradient(135deg, #f6f8fa 0%, #e9ecef 100%)',
          borderRadius: '8px'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '16px' }}>🔍</div>
          <Text style={{ fontSize: '16px', color: '#666' }}>
            AI正在深度分析你的面试表现...
          </Text>
          <div style={{ marginTop: '16px' }}>
            <Text style={{ fontSize: '14px', color: '#999' }}>
              分析维度：语言表达 • 专业能力 • 逻辑思维 • 沟通技巧
            </Text>
          </div>
        </div>
      ) : analysis ? (
        <div style={{ padding: '20px' }}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {/* 导航标签 */}
            <Space size="large">
              <Button
                type={activeTab === 'overall' ? 'primary' : 'default'}
                icon={<FileTextOutlined />}
                onClick={() => setActiveTab('overall')}
              >
                整体分析
              </Button>
              <Button
                type={activeTab === 'detailed' ? 'primary' : 'default'}
                icon={<MessageOutlined />}
                onClick={() => setActiveTab('detailed')}
              >
                详细对话分析
              </Button>
              <Button
                type={activeTab === 'improvement' ? 'primary' : 'default'}
                icon={<ToolOutlined />}
                onClick={() => setActiveTab('improvement')}
              >
                提升建议
              </Button>
            </Space>

            {/* 内容区域 */}
            {activeTab === 'overall' && (
              <Card>
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  <div>
                    <Title level={4}>
                      <StarOutlined style={{ marginRight: 8 }} />
                      整体评价
                    </Title>
                    <Paragraph>{analysis.overallEvaluation}</Paragraph>
                  </div>
                  <Divider />
                  <div>
                    <Title level={4}>
                      <RiseOutlined style={{ marginRight: 8 }} />
                      能力分析
                    </Title>
                    <Paragraph>{analysis.competencyAnalysis}</Paragraph>
                  </div>
                </Space>
              </Card>
            )}

            {activeTab === 'detailed' && (
              <Card>
                <Timeline>
                  {analysis.detailedAnalysis.map((item, index) => (
                    <Timeline.Item key={item.questionId}>
                      <Collapse>
                        <Panel 
                          header={
                            <Text strong>
                              问题 {index + 1}：{item.question}
                            </Text>
                          } 
                          key="1"
                        >
                          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                            <div>
                              <Text type="secondary">应聘者回答：</Text>
                              <Paragraph>{item.answer}</Paragraph>
                            </div>
                            <Alert
                              message="分析意见"
                              description={item.analysis}
                              type="info"
                              showIcon
                            />
                          </Space>
                        </Panel>
                      </Collapse>
                    </Timeline.Item>
                  ))}
                </Timeline>
              </Card>
            )}

            {activeTab === 'improvement' && (
              <Card>
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  <div>
                    <Title level={4}>
                      <BulbOutlined style={{ marginRight: 8 }} />
                      改进建议
                    </Title>
                    <List
                      dataSource={analysis.improvementSuggestions}
                      renderItem={(item) => (
                        <List.Item>
                          <Alert
                            message={item}
                            type="info"
                            showIcon
                            style={{ width: '100%' }}
                          />
                        </List.Item>
                      )}
                    />
                  </div>
                  <Divider />
                  <div>
                    <Title level={4}>
                      <ToolOutlined style={{ marginRight: 8 }} />
                      能力提升建议
                    </Title>
                    {analysis.competencyImprovements.map((improvement, index) => (
                      <div key={index} style={{ marginBottom: '16px' }}>
                        <Text strong>{improvement.category}：</Text>
                        <List
                          dataSource={improvement.suggestions}
                          renderItem={(item) => (
                            <List.Item>
                              <Alert
                                message={item}
                                type="info"
                                showIcon
                                style={{ width: '100%' }}
                              />
                            </List.Item>
                          )}
                        />
                      </div>
                    ))}
                  </div>
                </Space>
              </Card>
            )}
          </Space>
        </div>
      ) : null}
    </Modal>
  );
};

const InterviewSimulator: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const interviewId = searchParams.get('interviewId');
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [userAnswer, setUserAnswer] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<string>('');
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingText, setRecordingText] = useState('');
  const recordingTextRef = useRef('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const interviewerService = useRef(new InterviewerService());
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const analysisService = useRef(new AnalysisService());
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [project, setProject] = useState<Project | null>(null);

  // 插入CSS样式
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = styleSheet;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // 检测屏幕尺寸
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 处理用户回答
  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim() || isProcessing) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: userAnswer.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setUserAnswer('');
    setIsProcessing(true);

    try {
      let assistantResponse = '';
      
      await interviewerService.current.chat(userAnswer.trim(), (chunk) => {
        assistantResponse += chunk;
      });

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'interviewer',
        content: assistantResponse,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);

      // 生成实时分析
      setCurrentAnalysis(`基于你的回答分析：

• 回答长度：${userAnswer.trim().length > 50 ? '详细' : '简洁'}
• 表达方式：${userAnswer.includes('。') ? '条理清晰' : '需要更多结构化'}
• 建议：${userAnswer.trim().length < 30 ? '可以提供更多具体例子和细节' : '继续保持详细的表达方式'}

继续回答下一个问题，展现你的专业能力！`);
    } catch (error) {
      console.error('处理回答失败:', error);
      message.error('处理回答失败，请重试');
    } finally {
      setIsProcessing(false);
    }
  };

  // 键盘事件处理
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitAnswer();
    }
  };

  // 初始化语音识别
  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'zh-CN';

      recognitionRef.current.onstart = () => {
        console.log('语音识别已启动');
        setIsRecording(true);
        setRecordingText('');
        recordingTextRef.current = '';
      };

      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        setRecordingText(transcript);
        recordingTextRef.current = transcript;
      };

      recognitionRef.current.onerror = (event) => {
        console.error('语音识别错误:', event.error);
        if (event.error === 'aborted') {
          return;
        }
        setIsRecording(false);
        message.error('语音识别失败，请重试');
      };

      recognitionRef.current.onend = () => {
        console.log('语音识别已结束');
        const finalText = recordingTextRef.current.trim();
        if (finalText) {
          setUserAnswer(prev => {
            if (prev) {
              return `${prev} ${finalText}`;
            }
            return finalText;
          });
        }
        setRecordingText('');
        recordingTextRef.current = '';
        setIsRecording(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // 初始化面试
  useEffect(() => {
    const initInterview = () => {
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        type: 'interviewer',
        content: interviewerService.current.getOpeningMessage(),
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    };

    initInterview();
  }, []);

  useEffect(() => {
    const projects = JSON.parse(localStorage.getItem('projects') || '[]');
    const currentProject = projects.find((p: Project) => p.id === id);
    if (currentProject) {
      setProject(currentProject);
      if (interviewId) {
        const interview = currentProject.interviews.find((i: Interview) => i.id === interviewId);
        if (interview) {
          setMessages(interview.messages);
        }
      }
    }
  }, [id, interviewId]);

  // 处理语音录制
  const handleVoiceRecord = () => {
    if (!recognitionRef.current) {
      message.error('您的浏览器不支持语音识别功能');
      return;
    }

    try {
      if (isRecording) {
        recognitionRef.current.stop();
      } else {
        recognitionRef.current.start();
      }
    } catch (error) {
      console.error('语音识别操作失败:', error);
      message.error('语音识别失败，请重试');
      setIsRecording(false);
    }
  };

  const saveInterview = async (analysis: any) => {
    if (!project) return;

    const newInterview: Interview = {
      id: interviewId || Date.now().toString(),
      date: new Date().toISOString(),
      duration: Math.floor((Date.now() - new Date(messages[0]?.timestamp).getTime()) / 60000),
      messages: messages,
      analysis: analysis
    };

    const updatedProject: Project = {
      ...project,
      interviews: interviewId
        ? project.interviews.map((i: Interview) => i.id === interviewId ? newInterview : i)
        : [...project.interviews, newInterview],
      lastModified: new Date().toISOString()
    };

    const projects = JSON.parse(localStorage.getItem('projects') || '[]');
    const updatedProjects = projects.map((p: Project) => 
      p.id === project.id ? updatedProject : p
    );
    localStorage.setItem('projects', JSON.stringify(updatedProjects));
    setProject(updatedProject);
  };

  const handleEndInterview = async () => {
    setIsAnalyzing(true);
    try {
      const analysis = await analysisService.current.analyzeInterview(messages);
      await saveInterview(analysis);
      const newInterviewId = interviewId || Date.now().toString();
      navigate(`/project/${id}/analysis?interviewId=${newInterviewId}`);
    } catch (error) {
      console.error('分析失败:', error);
      message.error(error instanceof Error ? error.message : '分析失败，请重试');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.starsLayer}></div>
      <div style={styles.content}>
        {/* 页面标题 */}
        <div style={styles.header} className="header">
          <Title level={2} style={styles.title} className="title">
            🎯 面试模拟系统
          </Title>
        </div>

        {/* 主要内容区域 */}
        <div 
          style={{
            ...styles.mainContent,
            ...(isMobile ? styles.mobileLayout : {}),
          }}
          className="main-content"
        >
          {/* 聊天面板 */}
          <div style={styles.chatPanel}>
            <div 
              style={styles.chatContainer}
              className="chat-scrollbar chat-container"
            >
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  style={{
                    ...styles.messageWrapper,
                    ...(message.type === 'user' ? styles.messageWrapperUser : {}),
                  }}
                >
                  <Avatar
                    size={40}
                    icon={message.type === 'user' ? <UserOutlined /> : <RobotOutlined />}
                    style={{
                      ...styles.avatar,
                      backgroundColor: message.type === 'user' ? '#4facfe' : '#52c41a',
                    }}
                  />
                  <div
                    style={{
                      ...styles.messageContent,
                      ...(message.type === 'user' ? styles.messageContentUser : styles.messageContentBot),
                    }}
                    className={`message-content ${message.type === 'user' ? 'message-arrow-user' : 'message-arrow-bot'}`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              {isProcessing && (
                <div style={styles.messageWrapper}>
                  <Avatar
                    size={40}
                    icon={<RobotOutlined />}
                    style={{
                      ...styles.avatar,
                      backgroundColor: '#52c41a',
                    }}
                  />
                  <div
                    style={{
                      ...styles.messageContent,
                      ...styles.messageContentBot,
                    }}
                    className="message-content message-arrow-bot"
                  >
                    <Text style={{ color: '#000000' }}>
                      面试官正在输入中...
                    </Text>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            <div style={styles.inputArea} className="input-area">
              {/* 录音状态提示 */}
              {isRecording && (
                <div style={styles.recordingIndicator}>
                  <SoundOutlined />
                  <span>正在录音... {recordingText && `"${recordingText}"`}</span>
                </div>
              )}

              <div style={styles.inputWrapper} className="input-wrapper">
              <TextArea
                  className="interview-textarea text-area"
                  style={styles.textArea}
                  value={isRecording ? (recordingText || userAnswer) : userAnswer}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                    if (!isRecording) {
                      setUserAnswer(e.target.value);
                    }
                  }}
                  onKeyDown={handleKeyPress}
                  placeholder={isRecording ? "正在录音转文字..." : "请输入你的回答，按回车键发送..."}
                  disabled={isProcessing}
                  autoSize={{ minRows: 2, maxRows: 4 }}
                />
                <Button
                  style={{
                    ...styles.actionButton,
                    ...(isRecording ? styles.recordingButton : styles.secondaryButton),
                  }}
                  className="action-button"
                  icon={isRecording ? <PauseOutlined /> : <AudioOutlined />}
                  onClick={handleVoiceRecord}
                  disabled={isProcessing}
                  title={isRecording ? "停止录音" : "开始录音"}
                />
                <Button
                  style={{
                    ...styles.actionButton,
                    ...styles.primaryButton,
                  }}
                  className="action-button"
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={handleSubmitAnswer}
                  disabled={!userAnswer.trim() || isProcessing || isRecording}
                  loading={isProcessing}
                  title="发送回答"
                />
              </div>
            </div>
          </div>

          {/* 分析面板 */}
          <div 
            style={{
              ...styles.analysisPanel,
              ...(isMobile ? styles.mobileAnalysisPanel : {}),
            }}
            className="analysis-panel"
          >
            <Title level={4} style={styles.analysisTitle}>
              📊 实时分析
            </Title>
            <div style={styles.analysisContent} className="analysis-content chat-scrollbar">
              {currentAnalysis || `💡 分析提示：

回答问题后，系统会实时分析你的表现，包括：

• 回答的完整性和逻辑性
• 语言表达的清晰度
• 专业知识的掌握程度
• 个人能力的展现情况

开始回答问题，获取专业的面试反馈吧！`}
            </div>
            <Button 
              type="primary" 
              block
              style={styles.analysisButton}
              onClick={() => setShowAnalysisModal(true)}
              disabled={messages.length < 3}
            >
              📋 查看详细分析报告
            </Button>
          </div>
        </div>
      </div>

      <AnalysisModal
        isVisible={showAnalysisModal}
        onClose={() => setShowAnalysisModal(false)}
        messages={messages}
      />
    </div>
  );
};

export default InterviewSimulator; 