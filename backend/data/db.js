/**
 * Bilink 个人交互主页系统 - 数据库管理
 * 
 * 负责管理SQLite数据库连接和用户信息的存储、读取
 * 
 * @file db.js
 * @author Bilink Team
 * @version 1.0.0
 * @since 2026-01-13
 */

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

// 获取当前文件和目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 数据库文件路径
const DB_PATH = path.join(__dirname, 'bilink.db');

/**
 * 数据库管理类
 */
export class DatabaseManager {
  constructor() {
    this.db = null;
    this.init();
  }

  /**
   * 初始化数据库连接和表结构
   */
  init() {
    try {
      // 连接数据库
      this.db = new Database(DB_PATH);
      
      // 创建用户表
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT 'admin',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      
      console.log('📁 Database initialized successfully');
    } catch (err) {
      console.error('❌ Failed to initialize database:', err);
      throw err;
    }
  }

  /**
   * 获取数据库连接
   * @returns {Database} SQLite数据库连接
   */
  getConnection() {
    if (!this.db) {
      this.init();
    }
    return this.db;
  }

  /**
   * 添加管理员用户
   * @param {Object} adminData - 管理员数据
   * @param {string} adminData.username - 用户名
   * @param {string} adminData.password - 密码
   * @returns {boolean} 是否添加成功
   */
  async addAdmin(adminData) {
    try {
      const db = this.getConnection();
      
      // 检查用户是否已存在
      const existingUser = db.prepare('SELECT * FROM users WHERE username = ?').get(adminData.username);
      if (existingUser) {
        console.log('⚠️  Admin user already exists');
        return false;
      }
      
      // 加密密码
      const hashedPassword = await bcrypt.hash(adminData.password, 10);
      
      // 插入用户数据
      const stmt = db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)');
      stmt.run(adminData.username, hashedPassword, 'admin');
      
      console.log('👤 Admin user added successfully');
      return true;
    } catch (err) {
      console.error('❌ Failed to add admin user:', err);
      return false;
    }
  }

  /**
   * 获取管理员用户
   * @returns {Object|null} 管理员用户信息
   */
  getAdmin() {
    try {
      const db = this.getConnection();
      const admin = db.prepare('SELECT id, username, role FROM users WHERE role = ?').get('admin');
      return admin;
    } catch (err) {
      console.error('❌ Failed to get admin user:', err);
      return null;
    }
  }

  /**
   * 通过用户名获取用户
   * @param {string} username - 用户名
   * @returns {Object|null} 用户信息
   */
  getUserByUsername(username) {
    try {
      const db = this.getConnection();
      const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
      return user;
    } catch (err) {
      console.error('❌ Failed to get user by username:', err);
      return null;
    }
  }

  /**
   * 更新管理员账户信息
   * @param {Object} adminData - 管理员数据
   * @param {string} adminData.username - 用户名
   * @returns {boolean} 是否更新成功
   */
  updateAdmin(adminData) {
    try {
      const db = this.getConnection();
      const stmt = db.prepare('UPDATE users SET username = ?, updated_at = CURRENT_TIMESTAMP WHERE role = ?');
      stmt.run(adminData.username, 'admin');
      return true;
    } catch (err) {
      console.error('❌ Failed to update admin user:', err);
      return false;
    }
  }

  /**
   * 更新管理员密码
   * @param {string} currentPassword - 当前密码
   * @param {string} newPassword - 新密码
   * @returns {Object} 包含成功状态和消息的对象
   */
  async updatePassword(currentPassword, newPassword) {
    try {
      const db = this.getConnection();
      
      // 获取当前管理员信息
      const admin = db.prepare('SELECT * FROM users WHERE role = ?').get('admin');
      if (!admin) {
        return { success: false, message: '管理员用户不存在' };
      }
      
      // 验证当前密码
      const isValidPassword = await bcrypt.compare(currentPassword, admin.password);
      if (!isValidPassword) {
        return { success: false, message: '当前密码错误' };
      }
      
      // 加密新密码
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // 更新密码
      const stmt = db.prepare('UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE role = ?');
      stmt.run(hashedPassword, 'admin');
      
      return { success: true, message: '密码更新成功' };
    } catch (err) {
      console.error('❌ Failed to update password:', err);
      return { success: false, message: '密码更新失败' };
    }
  }

  /**
   * 关闭数据库连接
   */
  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

// 创建数据库管理器实例
export const dbManager = new DatabaseManager();
