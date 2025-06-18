import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Row, Col, Statistic, List, Typography, Empty, Space, Tag, Timeline } from 'antd';
import {
  PlayCircleOutlined,
  BarChartOutlined,
  HistoryOutlined,
  ClockCircleOutlined,
  MessageOutlined,
} from '@ant-design/icons';

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

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    const projects = JSON.parse(localStorage.getItem('projects') || '[]');
    const currentProject = projects.find((p: Project) => p.id === id);
    if (currentProject) {
      setProject(currentProject);
    }
  }, [id]);

  if (!project) {
    return <Empty description="项目不存在" />;
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
      <Card
        title={project.title}
        extra={
          <Space>
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={() => navigate(`/project/${id}/simulate`)}
            >
              开始模拟面试
            </Button>
          </Space>
        }
      >
        <Row gutter={[24, 24]}>
          <Col span={8}>
            <Statistic
              title="创建时间"
              value={formatDate(project.createdAt)}
              prefix={<HistoryOutlined />}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="最后修改"
              value={formatDate(project.lastModified)}
              prefix={<HistoryOutlined />}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="面试次数"
              value={project.interviews.length}
              prefix={<MessageOutlined />}
            />
          </Col>
        </Row>
      </Card>

      <Card
        title="面试记录"
        style={{ marginTop: '24px' }}
      >
        {project.interviews.length === 0 ? (
          <Empty description="暂无面试记录" />
        ) : (
          <Timeline>
            {project.interviews.map((interview) => (
              <Timeline.Item
                key={interview.id}
                color="blue"
                dot={<MessageOutlined />}
              >
                <Card
                  size="small"
                  style={{ marginBottom: '16px' }}
                >
                  <Row gutter={[16, 16]}>
                    <Col span={24}>
                      <Space>
                        <Tag color="blue">{formatDate(interview.date)}</Tag>
                        <Tag icon={<ClockCircleOutlined />} color="green">
                          时长：{formatDuration(interview.duration)}
                        </Tag>
                        <Tag color="purple">
                          得分：{interview.analysis.overallScore}
                        </Tag>
                      </Space>
                    </Col>
                    <Col span={24}>
                      <Space>
                        <Button
                          type="primary"
                          size="small"
                          icon={<MessageOutlined />}
                          onClick={() => navigate(`/project/${id}/simulate?interviewId=${interview.id}`)}
                        >
                          查看对话
                        </Button>
                        <Button
                          size="small"
                          icon={<BarChartOutlined />}
                          onClick={() => navigate(`/project/${id}/analysis?interviewId=${interview.id}`)}
                        >
                          查看分析
                        </Button>
                      </Space>
                    </Col>
                  </Row>
                </Card>
              </Timeline.Item>
            ))}
          </Timeline>
        )}
      </Card>
    </div>
  );
};

export default ProjectDetail; 