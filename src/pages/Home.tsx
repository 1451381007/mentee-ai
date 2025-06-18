import React from 'react';
import { Typography, Card, Row, Col, Tooltip, Modal } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  FileTextOutlined,
  PlayCircleOutlined,
  RiseOutlined,
  WechatOutlined
} from '@ant-design/icons';

const { Title, Paragraph } = Typography;

// 微信二维码图片（请将二维码图片放到 public 目录下，命名为 wechat_qr.png）
const wechatQR = process.env.PUBLIC_URL + '/wechat_qr.png';

// CSS样式对象
const styles = {
  container: {
    minHeight: '100vh',
    padding: '40px 20px',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    position: 'relative' as const,
    overflow: 'hidden' as const,
  },
  starsLayer: {
    position: 'absolute' as const,
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
    animation: 'rotate 120s linear infinite',
  },
  contentWrapper: {
    position: 'relative' as const,
    zIndex: 1,
    maxWidth: '1200px',
    margin: '0 auto',
  },
  title: {
    color: '#fff',
    textAlign: 'center' as const,
    fontSize: '3.5rem',
    marginBottom: '1rem',
    textShadow: '0 0 20px rgba(79, 172, 254, 0.5)',
    fontWeight: 'bold' as const,
  },
  subtitle: {
    color: '#4facfe',
    textAlign: 'center' as const,
    fontSize: '1.8rem',
    marginBottom: '2rem',
    textShadow: '0 0 10px rgba(79, 172, 254, 0.3)',
  },
  paragraph: {
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center' as const,
    fontSize: '1.2rem',
    marginBottom: '3rem',
    maxWidth: '800px',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  card: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    transition: 'all 0.3s ease',
    borderRadius: '16px',
    overflow: 'hidden',
  },
  cardHover: {
    transform: 'translateY(-5px)',
    borderColor: 'rgba(79, 172, 254, 0.5)',
    boxShadow: '0 8px 32px rgba(79, 172, 254, 0.2)',
  },
  iconContainer: {
    padding: '32px',
    textAlign: 'center' as const,
    background: 'linear-gradient(135deg, rgba(79, 172, 254, 0.1) 0%, rgba(79, 172, 254, 0.05) 100%)',
  },
  icon: {
    fontSize: '64px',
    color: '#4facfe',
    transition: 'all 0.3s ease',
    filter: 'drop-shadow(0 0 10px rgba(79, 172, 254, 0.5))',
  },
  contactBtn: {
    position: 'fixed' as 'fixed',
    top: '120px',
    left: '24px',
    zIndex: 100,
    display: 'flex',
    flexDirection: 'column' as 'column',
    alignItems: 'center',
    cursor: 'pointer',
    background: 'rgba(255,255,255,0.15)',
    borderRadius: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
    padding: '12px 8px',
    transition: 'all 0.2s',
    border: '1px solid rgba(79,172,254,0.15)'
  },
  contactIcon: {
    fontSize: '32px',
    color: '#4facfe',
    marginBottom: '4px',
    filter: 'drop-shadow(0 0 6px #4facfe33)'
  },
  contactText: {
    color: '#4facfe',
    fontSize: '14px',
    fontWeight: 500,
    letterSpacing: '2px',
    textShadow: '0 0 6px #fff',
    writingMode: 'vertical-lr' as 'vertical-lr',
    marginTop: '2px'
  },
  qrThumb: {
    width: '38px',
    height: '38px',
    borderRadius: '8px',
    margin: '6px 0',
    boxShadow: '0 2px 8px rgba(79,172,254,0.15)',
    border: '1px solid #e6f7ff',
    objectFit: 'cover' as 'cover'
  },
  modalImg: {
    width: '220px',
    height: '220px',
    borderRadius: '16px',
    display: 'block',
    margin: '0 auto 16px auto',
    boxShadow: '0 4px 24px rgba(79,172,254,0.18)'
  },
  modalText: {
    color: '#222',
    fontSize: '16px',
    lineHeight: 1.8,
    marginTop: '8px',
    textAlign: 'center' as 'center'
  }
};

// CSS动画
const styleSheet = `
  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
  
  .home-card:hover .home-icon {
    transform: scale(1.1) rotate(5deg);
  }
  
  .home-card .ant-card-meta-title {
    color: #fff !important;
    font-size: 1.4rem !important;
    text-align: center;
    margin-top: 16px;
  }
  
  .home-card .ant-card-meta-description {
    color: rgba(255, 255, 255, 0.7) !important;
    text-align: center;
    font-size: 1.1rem;
  }

  @keyframes float {
    0% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-10px);
    }
    100% {
      transform: translateY(0px);
    }
  }

  .floating {
    animation: float 3s ease-in-out infinite;
  }
`;

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = React.useState<number | null>(null);
  const [qrVisible, setQrVisible] = React.useState(false);

  // 插入CSS样式
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = styleSheet;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const handleCardClick = (path: string) => {
    navigate(path);
  };

  return (
    <div style={styles.container}>
      {/* 联系开发者入口 */}
      <div style={styles.contactBtn} onClick={() => setQrVisible(true)}>
        <WechatOutlined style={styles.contactIcon} />
        <img src={wechatQR} alt="微信二维码" style={styles.qrThumb} />
        <div style={styles.contactText}>联系开发者</div>
      </div>
      {/* 微信二维码弹窗 */}
      <Modal
        open={qrVisible}
        onCancel={() => setQrVisible(false)}
        footer={null}
        centered
        width={540}
        bodyStyle={{ 
          padding: 32, 
          textAlign: 'left', 
          background: 'linear-gradient(135deg, #e0f7fa 0%, #f8fafc 100%)',
          borderRadius: 20,
          boxShadow: '0 8px 32px rgba(79,172,254,0.10)'
        }}
      >
        <img src={wechatQR} alt="微信二维码" style={{...styles.modalImg, marginLeft: 'auto', marginRight: 'auto', display: 'block'}} />
        <div style={{ textAlign: 'center', color: '#888', fontSize: '12px', marginTop: '4px', marginBottom: '10px', letterSpacing: '1px' }}>
          扫码关注微信公众号
        </div>
        <div style={{
          color: '#222',
          fontSize: '14px',
          lineHeight: 1.8,
          marginTop: '8px',
          textAlign: 'left',
          background: 'rgba(255,255,255,0.7)',
          borderRadius: '12px',
          padding: '18px 20px',
          boxShadow: '0 2px 8px rgba(79,172,254,0.06)',
          fontFamily: '"Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", Arial, sans-serif'
        }}>
          <b>HI 我是Lucas.S</b>，我是这个产品的设计者、开发者、运营者，很荣幸能给你带来好的服务。<br/><br/>
          之所以做这个产品，是因为自己参加过很多面试，也面试了很多人，同时给许多刚毕业或者新人小朋友做过简历优化、面试辅导，都取得了一定的正向反馈，所以自认为在这方面有一定的天赋，也希望能给许多年轻人带来帮助。<br/><br/>
          欢迎关注开发者公众号，您可以获取更多求职技巧，也可以一起探索AI发展未来。目前产品新发布期间，后续会考虑创建社群，做一些面试交流、求职推荐。如有兴趣可加作者本人微信：<b>ssysghhz</b>
        </div>
      </Modal>
      <div style={styles.starsLayer}></div>
      <div style={styles.contentWrapper}>
        <Title style={styles.title}>职达ZhiGO</Title>
        <Title level={2} style={styles.subtitle}>智能面试模拟系统</Title>
        <Paragraph style={styles.paragraph}>
          基于AI技术的智能面试模拟与分析系统，帮助您提升面试技能，实现职业理想。
          通过模拟真实面试场景，提供专业的分析和建议，让您的面试表现更上一层楼。
        </Paragraph>

        <Row gutter={[32, 32]} justify="center">
          <Col xs={24} sm={12} md={8}>
            <Tooltip title="功能开发中，敬请期待">
              <Card
                className="home-card"
                hoverable
                style={{
                  ...styles.card,
                  ...(hoveredCard === 0 ? styles.cardHover : {}),
                  opacity: 0.7,
                  cursor: 'not-allowed'
                }}
                onMouseEnter={() => setHoveredCard(0)}
                onMouseLeave={() => setHoveredCard(null)}
                cover={
                  <div style={styles.iconContainer}>
                    <FileTextOutlined className="home-icon floating" style={styles.icon} />
                  </div>
                }
              >
                <Card.Meta
                  title="简历优化"
                  description="智能分析简历内容，提供专业优化建议"
                />
              </Card>
            </Tooltip>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Card
              className="home-card"
              hoverable
              onClick={() => handleCardClick('/interview')}
              style={{
                ...styles.card,
                ...(hoveredCard === 1 ? styles.cardHover : {}),
              }}
              onMouseEnter={() => setHoveredCard(1)}
              onMouseLeave={() => setHoveredCard(null)}
              cover={
                <div style={styles.iconContainer}>
                  <PlayCircleOutlined className="home-icon floating" style={styles.icon} />
                </div>
              }
            >
              <Card.Meta
                title="模拟面试"
                description="进行智能面试模拟训练，提升实战能力"
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Tooltip title="功能开发中，敬请期待">
              <Card
                className="home-card"
                hoverable
                style={{
                  ...styles.card,
                  ...(hoveredCard === 2 ? styles.cardHover : {}),
                  opacity: 0.7,
                  cursor: 'not-allowed'
                }}
                onMouseEnter={() => setHoveredCard(2)}
                onMouseLeave={() => setHoveredCard(null)}
                cover={
                  <div style={styles.iconContainer}>
                    <RiseOutlined className="home-icon floating" style={styles.icon} />
                  </div>
                }
              >
                <Card.Meta
                  title="深度提升"
                  description="个性化学习路径，全面提升职业竞争力"
                />
              </Card>
            </Tooltip>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default Home; 