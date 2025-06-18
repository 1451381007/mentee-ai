import React, { useState, useEffect } from 'react';
import { Card, Button, Row, Col, Typography, Input, message, Modal, Space, Popconfirm, Empty } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CalendarOutlined, HistoryOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

interface Project {
  id: string;
  title: string;
  createdAt: string;
  lastModified: string;
  interviews: {
    id: string;
    date: string;
    duration: number;
    messages: {
      id: string;
      type: 'user' | 'interviewer';
      content: string;
      timestamp: Date;
    }[];
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
  }[];
}

const ProjectList: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // 从本地存储加载项目列表
    const savedProjects = localStorage.getItem('projects');
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects));
    }
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\//g, '-');
  };

  const handleStartInterview = () => {
    const now = new Date();
    const defaultTitle = `${formatDate(now)} 面试`;
    setNewProjectTitle(defaultTitle);
    setIsConfirmModalVisible(true);
  };

  const handleConfirmStart = () => {
    if (!newProjectTitle.trim()) {
      message.error('项目名称不能为空');
      return;
    }

    const now = new Date();
    const newProject: Project = {
      id: Date.now().toString(),
      title: newProjectTitle.trim(),
      createdAt: now.toISOString(),
      lastModified: now.toISOString(),
      interviews: [],
    };

    const updatedProjects = [...projects, newProject];
    setProjects(updatedProjects);
    localStorage.setItem('projects', JSON.stringify(updatedProjects));
    
    setIsConfirmModalVisible(false);
    // 导航到面试模拟页面
    navigate(`/project/${newProject.id}/simulate`);
  };

  const handleEditTitle = (project: Project) => {
    setEditingId(project.id);
    setEditingTitle(project.title);
  };

  const handleSaveTitle = (projectId: string) => {
    if (!editingTitle.trim()) {
      message.error('项目名称不能为空');
      return;
    }

    const updatedProjects = projects.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          title: editingTitle.trim(),
          lastModified: new Date().toISOString()
        };
      }
      return p;
    });

    setProjects(updatedProjects);
    localStorage.setItem('projects', JSON.stringify(updatedProjects));
    setEditingId(null);
    setEditingTitle('');
    message.success('名称修改成功');
  };

  const handleDeleteProject = (projectId: string) => {
    const updatedProjects = projects.filter(p => p.id !== projectId);
    setProjects(updatedProjects);
    localStorage.setItem('projects', JSON.stringify(updatedProjects));
    message.success('删除成功');
  };

  return (
    <div style={{ padding: '24px' }}>
      <div className="page-header">
        <Row justify="space-between" align="middle" style={{ marginBottom: 40 }}>
          <Col>
            <Title level={2} style={{ margin: 0 }}>我的面试项目</Title>
            <Text className="slogan">
              管理您的所有面试记录，开启专业的面试之旅
            </Text>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleStartInterview}
              size="large"
              style={{
                height: '48px',
                padding: '0 32px',
                fontSize: '16px',
                borderRadius: '8px'
              }}
            >
              开始面试
            </Button>
          </Col>
        </Row>
      </div>

      {projects.length === 0 ? (
        <Empty
          image={
            <div style={{ 
              fontSize: '64px', 
              color: '#666',
              marginBottom: '16px'
            }}>
              📁
            </div>
          }
          description={
            <div style={{ textAlign: 'center' }}>
              <Text 
                style={{ 
                  fontSize: '16px',
                  color: '#333',
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: 600
                }}
              >
                还没有面试项目
              </Text>
              <Text 
                style={{ 
                  fontSize: '14px',
                  color: '#666'
                }}
              >
                点击"开始面试"创建您的第一个面试项目
              </Text>
            </div>
          }
        />
      ) : (
        <Row gutter={[24, 24]}>
          {projects.map((project) => (
            <Col xs={24} sm={12} md={8} lg={6} key={project.id}>
              <Card
                hoverable
                className="project-card"
                actions={[
                  <EditOutlined key="edit" onClick={(e) => {
                    e.stopPropagation();
                    handleEditTitle(project);
                  }} />,
                  <Popconfirm
                    title="确定要删除这个项目吗？"
                    description="删除后无法恢复，请谨慎操作。"
                    onConfirm={(e) => {
                      e?.stopPropagation();
                      handleDeleteProject(project.id);
                    }}
                    onCancel={(e) => e?.stopPropagation()}
                    okText="确定"
                    cancelText="取消"
                  >
                    <DeleteOutlined key="delete" onClick={(e) => e.stopPropagation()} />
                  </Popconfirm>
                ]}
                onClick={() => navigate(`/project/${project.id}`)}
                styles={{ 
                  body: { 
                    padding: '24px' 
                  } 
                }}
              >
                {editingId === project.id ? (
                  <Input
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onPressEnter={() => handleSaveTitle(project.id)}
                    onBlur={() => handleSaveTitle(project.id)}
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <div>
                    <Title level={4} style={{ marginBottom: 16 }}>
                      {project.title}
                    </Title>
                    <Space direction="vertical" size={8} style={{ width: '100%' }}>
                      <Text type="secondary">
                        <CalendarOutlined style={{ marginRight: 8 }} />
                        创建时间：{new Date(project.createdAt).toLocaleDateString()}
                      </Text>
                      <Text type="secondary">
                        <HistoryOutlined style={{ marginRight: 8 }} />
                        最后修改：{new Date(project.lastModified).toLocaleDateString()}
                      </Text>
                    </Space>
                  </div>
                )}
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Modal
        title="开始新的面试"
        open={isConfirmModalVisible}
        onOk={handleConfirmStart}
        onCancel={() => setIsConfirmModalVisible(false)}
        okText="开始面试"
        cancelText="取消"
        width={480}
        centered
      >
        <div style={{ marginBottom: 16 }}>
          <Text style={{ display: 'block', marginBottom: 12 }}>请确认或修改面试项目名称：</Text>
          <Input
            value={newProjectTitle}
            onChange={(e) => setNewProjectTitle(e.target.value)}
            placeholder="请输入项目名称"
            size="large"
            autoFocus
          />
        </div>
      </Modal>
    </div>
  );
};

export default ProjectList; 