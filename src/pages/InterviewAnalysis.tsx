import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import {
  Typography,
  Card,
  Row,
  Col,
  Progress,
  Timeline,
  Collapse,
  Divider,
  Button,
  Space,
  Tag,
  Statistic,
  Alert,
  Empty,
  List
} from 'antd';
import {
  TrophyOutlined,
  RiseOutlined,
  BulbOutlined,
  MessageOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  HistoryOutlined,
  FileTextOutlined,
  StarOutlined,
  ToolOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;

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

const InterviewAnalysis: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const interviewId = searchParams.get('interviewId');
  const [project, setProject] = useState<Project | null>(null);
  const [interview, setInterview] = useState<Interview | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const projects = JSON.parse(localStorage.getItem('projects') || '[]');
    const currentProject = projects.find((p: Project) => p.id === id);
    if (currentProject) {
      setProject(currentProject);
      if (interviewId) {
        const currentInterview = currentProject.interviews.find((i: Interview) => i.id === interviewId);
        if (currentInterview) {
          setInterview(currentInterview);
        }
      }
    }
  }, [id, interviewId]);

  if (!project || !interview) {
    return <Empty description="未找到面试记录" />;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}小时${mins}分钟`;
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Row gutter={[24, 24]}>
          <Col span={24}>
            <Title level={2}>面试分析报告</Title>
            <Space>
              <Tag color="blue">{formatDate(interview.date)}</Tag>
              <Tag icon={<HistoryOutlined />} color="green">
                时长：{formatDuration(interview.duration)}
              </Tag>
              <Tag color="purple">
                得分：{interview.analysis.overallScore}
              </Tag>
            </Space>
          </Col>
        </Row>
      </Card>

      <Card style={{ marginTop: '24px' }}>
        <Row gutter={[24, 24]}>
          <Col span={24}>
            <Statistic
              title="整体评分"
              value={interview.analysis.overallScore}
              suffix="分"
              prefix={<TrophyOutlined />}
            />
            <Progress
              percent={interview.analysis.overallScore}
              status="active"
              strokeColor={{
                '0%': '#108ee9',
                '100%': '#87d068',
              }}
            />
          </Col>
          <Col span={24}>
            <Alert
              message="整体评价"
              description={interview.analysis.overallEvaluation}
              type="info"
              showIcon
            />
          </Col>
          <Col span={24}>
            <Alert
              message="能力分析"
              description={interview.analysis.competencyAnalysis}
              type="success"
              showIcon
            />
          </Col>
        </Row>
      </Card>

      <Card title="详细分析" style={{ marginTop: '24px' }}>
        <Timeline>
          {interview.analysis.detailedAnalysis.map((item, index) => (
            <Timeline.Item
              key={item.questionId}
              dot={<MessageOutlined />}
            >
              <Card size="small" style={{ marginBottom: '16px' }}>
                <Paragraph>
                  <Text strong>问题 {index + 1}：</Text>
                  {item.question}
                </Paragraph>
                <Paragraph>
                  <Text strong>回答：</Text>
                  {item.answer}
                </Paragraph>
                <Paragraph>
                  <Text strong>分析：</Text>
                  {item.analysis}
                </Paragraph>
              </Card>
            </Timeline.Item>
          ))}
        </Timeline>
      </Card>

      <Card title="改进建议" style={{ marginTop: '24px' }}>
        <Collapse>
          <Panel header="整体建议" key="1">
            <List
              dataSource={interview.analysis.improvementSuggestions}
              renderItem={(item: string) => (
                <List.Item>
                  <Space>
                    <BulbOutlined style={{ color: '#1890ff' }} />
                    <Text>{item}</Text>
                  </Space>
                </List.Item>
              )}
            />
          </Panel>
          {interview.analysis.competencyImprovements.map((improvement, index) => (
            <Panel header={improvement.category} key={index + 2}>
              <List
                dataSource={improvement.suggestions}
                renderItem={(item: string) => (
                  <List.Item>
                    <Space>
                      <RiseOutlined style={{ color: '#52c41a' }} />
                      <Text>{item}</Text>
                    </Space>
                  </List.Item>
                )}
              />
            </Panel>
          ))}
        </Collapse>
      </Card>
    </div>
  );
};

export default InterviewAnalysis; 