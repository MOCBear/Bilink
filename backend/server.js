/**
 * Bilink 个人交互主页系统 - 后端服务器入口
 * 
 * 该文件是后端服务器的启动入口，负责配置 Express 应用、中间件和路由
 * 
 * @file server.js
 * @author Bilink Team
 * @version 1.0.0
 * @since 2026-01-13
 */

import express from 'express' // Express 框架，用于构建 Web 服务器
import cors from 'cors' // 跨域资源共享中间件
import dotenv from 'dotenv' // 环境变量管理
import authRoutes from './routes/auth.js' // 认证路由
import profileRoutes from './routes/profile.js' // 个人资料路由
import { initializeData } from './data/store.js' // 数据初始化函数

// 加载环境变量
dotenv.config()

// 创建 Express 应用实例
const app = express()
// 服务器端口，默认 5000
const PORT = process.env.PORT || 5000

// 配置中间件
app.use(cors()) // 启用 CORS，允许跨域请求
app.use(express.json()) // 解析 JSON 请求体

// 初始化数据存储
initializeData()

// 配置路由
app.use('/api/auth', authRoutes) // 认证相关路由
app.use('/api/profile', profileRoutes) // 个人资料相关路由

// 健康检查路由
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// 全局错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack) // 打印错误堆栈
  res.status(500).json({ message: '服务器内部错误' }) // 返回 500 错误
})

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`📝 Admin login: /api/auth/login`)
  console.log(`👤 Profile API: /api/profile`)
})
