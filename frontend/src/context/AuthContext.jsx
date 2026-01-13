/**
 * Bilink 个人交互主页系统 - 认证上下文
 * 
 * 该文件实现了全局认证状态管理，包括登录、登出和令牌验证功能
 * 
 * @file AuthContext.jsx
 * @author Bilink Team
 * @version 1.0.0
 * @since 2026-01-13
 */

import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios' // HTTP 客户端，用于与后端 API 通信

/**
 * 认证上下文对象
 * 
 * 创建一个 React Context，用于在组件树中传递认证状态
 */
const AuthContext = createContext(null)

/**
 * 认证上下文钩子
 * 
 * 用于在组件中访问认证状态和方法
 * 
 * @returns {Object} 认证上下文值，包含 user、loading、login、logout 和 isAdmin
 * @throws {Error} 如果在 AuthProvider 外部使用
 */
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

/**
 * 认证提供者组件
 * 
 * 为应用提供全局认证状态管理
 * 
 * @param {Object} props - 组件属性
 * @param {React.ReactNode} props.children - 子组件
 * @returns {JSX.Element} 认证提供者组件
 */
export const AuthProvider = ({ children }) => {
  // 认证状态
  const [user, setUser] = useState(null) // 当前登录用户信息
  const [loading, setLoading] = useState(true) // 加载状态

  /**
   * 初始化认证状态
   * 
   * 组件挂载时，检查本地存储中是否存在令牌
   * 如果存在令牌，则验证令牌有效性
   */
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      verifyToken(token)
    } else {
      setLoading(false)
    }
  }, [])

  /**
   * 验证令牌有效性
   * 
   * @param {string} token - JWT 令牌
   * @returns {Promise<void>}
   */
  const verifyToken = async (token) => {
    try {
      // 设置默认请求头，包含认证令牌
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      // 调用后端 API 验证令牌
      const res = await axios.get('/api/auth/verify')
      // 更新用户状态
      setUser(res.data.user)
    } catch (err) {
      // 令牌无效，清除本地存储中的令牌
      localStorage.removeItem('token')
      delete axios.defaults.headers.common['Authorization']
    } finally {
      // 结束加载状态
      setLoading(false)
    }
  }

  /**
   * 用户登录
   * 
   * @param {string} username - 用户名
   * @param {string} password - 密码
   * @returns {Promise<Object>} 登录结果，包含 success 和 message
   */
  const login = async (username, password) => {
    try {
      // 调用后端登录 API
      const res = await axios.post('/api/auth/login', { username, password })
      const { token, user } = res.data
      
      // 存储令牌到本地存储
      localStorage.setItem('token', token)
      // 设置默认请求头
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      // 更新用户状态
      setUser(user)
      
      return { success: true }
    } catch (err) {
      // 登录失败，返回错误信息
      return { 
        success: false, 
        message: err.response?.data?.message || '登录失败' 
      }
    }
  }

  /**
   * 用户登出
   * 
   * 清除本地存储中的令牌，重置用户状态
   */
  const logout = () => {
    localStorage.removeItem('token')
    delete axios.defaults.headers.common['Authorization']
    setUser(null)
  }

  /**
   * 认证上下文值
   * 
   * 包含认证状态和方法
   */
  const value = {
    user, // 当前登录用户信息
    loading, // 加载状态
    login, // 登录方法
    logout, // 登出方法
    isAdmin: user?.role === 'admin' // 是否为管理员
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
