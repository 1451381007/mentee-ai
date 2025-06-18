import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from 'antd';
import Home from './pages/Home';
import ProjectList from './pages/ProjectList';
import ProjectDetail from './pages/ProjectDetail';
import InterviewSimulator from './pages/InterviewSimulator';
import InterviewAnalysis from './pages/InterviewAnalysis';
import Navbar from './components/Navbar';
import './App.css';

const { Header, Content } = Layout;

const App: React.FC = () => {
  return (
    <Layout className="app-layout">
      <Header className="app-header">
        <Navbar />
      </Header>
      <Content className="app-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/projects" element={<ProjectList />} />
          <Route path="/project/:id" element={<ProjectDetail />} />
          <Route path="/interview" element={<InterviewSimulator />} />
          <Route path="/analysis" element={<InterviewAnalysis />} />
        </Routes>
      </Content>
    </Layout>
  );
};

export default App; 