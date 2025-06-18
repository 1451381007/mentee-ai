import React from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const Register: React.FC = () => {
  const navigate = useNavigate();

  const onFinish = (values: { username: string; password: string; confirmPassword: string }) => {
    if (values.password !== values.confirmPassword) {
      message.error('两次输入的密码不一致！');
      return;
    }

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.some((u: any) => u.username === values.username)) {
      message.error('该账号已被注册！');
      return;
    }

    users.push({
      username: values.username,
      password: values.password
    });

    localStorage.setItem('users', JSON.stringify(users));
    message.success('注册成功！');
    navigate('/login');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute',
        width: '200%',
        height: '200%',
        top: '-50%',
        left: '-50%',
        zIndex: 0,
        backgroundImage: `
          radial-gradient(2px 2px at 40px 60px, #ffffff15 50%, transparent 100%),
          radial-gradient(2px 2px at 20px 50px, #ffffff10 50%, transparent 100%),
          radial-gradient(2px 2px at 30px 100px, #ffffff20 50%, transparent 100%),
          radial-gradient(2px 2px at 40px 60px, #ffffff15 50%, transparent 100%),
          radial-gradient(2px 2px at 110px 90px, #ffffff30 50%, transparent 100%),
          radial-gradient(2px 2px at 190px 150px, #ffffff10 50%, transparent 100%)
        `,
        animation: 'rotate 120s linear infinite'
      }}></div>

      <Card style={{
        width: 400,
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <Title level={2} style={{ color: '#fff', marginBottom: 10 }}>模拟面试系统</Title>
          <Title level={4} style={{ color: 'rgba(255, 255, 255, 0.7)' }}>注册</Title>
        </div>

        <Form
          name="register"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: '请输入账号！' },
              { pattern: /^\d{8}$/, message: '账号必须为8位数字！' }
            ]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="请输入8位数字账号" 
              size="large"
              style={{ background: 'rgba(255, 255, 255, 0.1)', border: 'none', color: '#fff' }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入密码！' },
              { min: 6, message: '密码长度不能小于6位！' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请输入密码"
              size="large"
              style={{ background: 'rgba(255, 255, 255, 0.1)', border: 'none', color: '#fff' }}
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            rules={[
              { required: true, message: '请确认密码！' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致！'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请确认密码"
              size="large"
              style={{ background: 'rgba(255, 255, 255, 0.1)', border: 'none', color: '#fff' }}
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large" style={{ background: '#4facfe' }}>
              注册
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            <Button type="link" onClick={() => navigate('/login')} style={{ color: '#4facfe' }}>
              已有账号？立即登录
            </Button>
          </div>
        </Form>
      </Card>

      <style>
        {`
          @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default Register; 