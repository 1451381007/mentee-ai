import React from 'react';
import { Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div style={{
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
      overflow: 'hidden'
    }}>
      {/* 背景光效 */}
      <div style={{
        position: 'absolute',
        top: '-50%',
        left: '-50%',
        width: '200%',
        height: '200%',
        background: 'radial-gradient(circle at center, rgba(79, 172, 254, 0.1) 0%, transparent 70%)',
        animation: 'rotate 20s linear infinite',
        pointerEvents: 'none'
      }} />
      
      {!isHomePage && (
        <Button
          type="text"
          icon={<ArrowLeftOutlined style={{ fontSize: '20px' }} />}
          onClick={() => navigate('/')}
          style={{
            position: 'absolute',
            left: '20px',
            color: '#fff',
            fontSize: '16px',
            display: 'flex',
            alignItems: 'center',
            height: '44px',
            width: '44px',
            padding: '0',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '12px',
            transition: 'all 0.3s ease',
            zIndex: 1,
            backdropFilter: 'blur(5px)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
          }}
        />
      )}
      <div style={{
        fontSize: '28px',
        fontWeight: 'bold',
        background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        textShadow: '0 0 20px rgba(79, 172, 254, 0.3)',
        letterSpacing: '3px',
        zIndex: 1,
        position: 'relative'
      }}>
        职达ZhiGO
      </div>
      {!isHomePage && <div style={{ width: '72px' }} />}
      
      {/* 底部渐变 */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '30px',
        background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.08), transparent)',
        pointerEvents: 'none',
        zIndex: 0
      }} />
    </div>
  );
};

export default Navbar; 