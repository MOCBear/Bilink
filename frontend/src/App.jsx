/**
 * Bilink 个人交互主页系统 - 应用主组件
 * 
 * 该组件是前端应用的主组件，负责配置应用的路由结构
 * 
 * @file App.jsx
 * @author Bilink Team
 * @version 1.0.0
 * @since 2026-01-13
 */

import { Routes, Route } from 'react-router-dom' // 路由组件，用于定义路由规则
import Home from './pages/Home' // 主页组件，展示个人信息和作品
import Login from './pages/Login' // 登录页面组件，用于管理员登录
import Admin from './pages/Admin' // 管理员控制面板组件，用于编辑内容

/**
 * 应用主组件
 * 
 * 定义应用的路由结构，包含以下路由：
 * - / - 主页，展示个人信息、技能、项目等
 * - /login - 登录页面，管理员登录入口
 * - /admin - 管理员控制面板，用于编辑内容
 * 
 * @returns {JSX.Element} 应用主组件
 */
function App() {
  return (
    <Routes>
      {/* 主页路由 */}
      <Route path="/" element={<Home />} />
      {/* 登录页面路由 */}
      <Route path="/login" element={<Login />} />
      {/* 管理员控制面板路由 */}
      <Route path="/admin" element={<Admin />} />
    </Routes>
  )
}

export default App
