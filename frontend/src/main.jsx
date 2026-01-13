/**
 * Bilink 个人交互主页系统 - 前端入口文件
 * 
 * 该文件是前端应用的启动入口，负责初始化 React 应用并配置必要的提供者
 * 
 * @file main.jsx
 * @author Bilink Team
 * @version 1.0.0
 * @since 2026-01-13
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' // 路由提供者，用于管理应用路由
import App from './App' // 应用主组件
import { AuthProvider } from './context/AuthContext' // 认证状态提供者
import './styles/glass.css' // 全局样式文件，包含液态玻璃效果

/**
 * 渲染 React 应用到 DOM
 * 
 * 使用 React 18 的新 API createRoot 创建根节点
 * 并将应用组件包装在以下提供者中：
 * 1. React.StrictMode - 启用严格模式，帮助发现潜在问题
 * 2. BrowserRouter - 启用客户端路由
 * 3. AuthProvider - 提供全局认证状态管理
 */
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
