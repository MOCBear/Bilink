/**
 * Bilink 个人交互主页系统 - 数据存储管理
 * 
 * 该文件负责数据的存储和管理，包括数据文件的创建、读取和写入
 * 
 * @file store.js
 * @author Bilink Team
 * @version 1.0.0
 * @since 2026-01-13
 */

import fs from 'fs' // 文件系统模块
import path from 'path' // 路径模块
import { fileURLToPath } from 'url' // URL 工具模块
import bcrypt from 'bcryptjs' // 密码加密模块
import { dbManager } from './db.js' // 数据库管理器

// 获取当前文件和目录路径
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 数据文件路径
const DATA_FILE = path.join(__dirname, 'data.json')

/**
 * 默认数据结构
 * 
 * 包含管理员账户和个人资料的默认数据
 */
const defaultData = {
  admin: {
    username: process.env.ADMIN_USERNAME || 'admin',
    password: '', // 将在初始化时加密
    role: 'admin'
  },
  profile: {
    name: 'Your Name',
    title: 'Creative Developer',
    bio: 'Welcome to my personal space. I create digital experiences.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bilink',
    about: '热爱技术，专注于创造优秀的数字体验。我相信好的设计和代码可以让世界变得更美好。',
    skills: [
      { name: 'JavaScript', icon: '🟨', level: 90 },
      { name: 'React', icon: '⚛️', level: 85 },
      { name: 'Node.js', icon: '💚', level: 80 },
      { name: 'Python', icon: '🐍', level: 75 },
      { name: 'UI/UX', icon: '🎨', level: 70 }
    ],
    projects: [
      {
        title: '个人主页',
        description: '一个现代化的个人展示页面，采用液态玻璃效果设计。',
        url: '#',
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400',
        tags: ['React', 'Node.js', 'CSS']
      }
    ],
    links: [
      { type: 'github', label: 'GitHub', url: 'https://github.com' },
      { type: 'twitter', label: 'Twitter', url: 'https://twitter.com' },
      { type: 'email', label: 'Email', url: 'mailto:hello@example.com' }
    ],
    contact: {
      email: 'hello@example.com',
      location: '中国'
    }
  }
}

/**
 * 从文件加载数据
 * 
 * @returns {Object|null} 加载的数据对象，如果加载失败则返回 null
 */
export function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf8')
      return JSON.parse(raw)
    }
  } catch (err) {
    console.error('Error loading data:', err)
  }
  return null
}

/**
 * 将数据保存到文件
 * 
 * @param {Object} data - 要保存的数据对象
 * @returns {boolean} 保存是否成功
 */
export function saveData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8')
    return true
  } catch (err) {
    console.error('Error saving data:', err)
    return false
  }
}

/**
 * 初始化数据存储
 * 
 * 如果数据文件不存在，则创建新的默认数据文件
 * 同时将管理员用户添加到数据库中
 * 
 * @returns {Promise<Object>} 初始化后的数据对象
 */
export async function initializeData() {
  let data = loadData()
  
  if (!data) {
    // 创建新的数据文件，包含加密后的密码
    const password = process.env.ADMIN_PASSWORD || 'admin123'
    const hashedPassword = await bcrypt.hash(password, 10)
    
    data = {
      ...defaultData,
      admin: {
        ...defaultData.admin,
        password: hashedPassword
      }
    }
    
    saveData(data)
    console.log('📁 Data file created with default settings')
    console.log(`👤 Admin username: ${data.admin.username}`)
    console.log(`🔑 Admin password: ${password}`)
  }
  
  // 初始化数据库，添加管理员用户
  const admin = {
    username: process.env.ADMIN_USERNAME || data.admin.username,
    password: process.env.ADMIN_PASSWORD || 'admin123'
  }
  await dbManager.addAdmin(admin)
  
  return data
}

/**
 * 获取管理员用户信息
 * 
 * @returns {Object|null} 管理员用户对象，如果不存在则返回 null
 */
export function getAdmin() {
  // 从数据库中获取管理员用户信息
  return dbManager.getAdmin()
}

/**
 * 获取个人资料数据
 * 
 * @returns {Object} 个人资料对象，如果数据文件不存在则返回默认数据
 */
export function getProfile() {
  const data = loadData()
  return data?.profile || defaultData.profile
}

/**
 * 更新个人资料数据
 * 
 * @param {Object} profileData - 新的个人资料数据
 * @returns {boolean} 更新是否成功
 */
export function updateProfile(profileData) {
  const data = loadData()
  if (data) {
    // 合并新数据和现有数据
    data.profile = { ...data.profile, ...profileData }
    return saveData(data)
  }
  return false
}

/**
 * 更新管理员账户信息
 * 
 * @param {Object} adminData - 新的管理员账户数据
 * @returns {boolean} 更新是否成功
 */
export function updateAdmin(adminData) {
  // 使用数据库更新管理员账户信息
  return dbManager.updateAdmin(adminData)
}

/**
 * 更新管理员密码
 * 
 * @param {string} currentPassword - 当前密码
 * @param {string} newPassword - 新密码
 * @returns {Object} 包含成功状态和消息的对象
 */
export async function updatePassword(currentPassword, newPassword) {
  // 使用数据库更新管理员密码
  return dbManager.updatePassword(currentPassword, newPassword)
}
