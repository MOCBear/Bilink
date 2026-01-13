import express from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { getAdmin, updateAdmin, updatePassword } from '../data/store.js'
import { authMiddleware, adminOnly } from '../middleware/auth.js'

const router = express.Router()

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ message: '请输入用户名和密码' })
    }

    const admin = getAdmin()
    
    if (!admin || admin.username !== username) {
      return res.status(401).json({ message: '用户名或密码错误' })
    }

    const isValidPassword = await bcrypt.compare(password, admin.password)
    
    if (!isValidPassword) {
      return res.status(401).json({ message: '用户名或密码错误' })
    }

    const token = jwt.sign(
      { 
        username: admin.username, 
        role: admin.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      token,
      user: {
        username: admin.username,
        role: admin.role
      }
    })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ message: '登录失败，请稍后重试' })
  }
})

// Verify token
router.get('/verify', authMiddleware, (req, res) => {
  res.json({
    user: {
      username: req.user.username,
      role: req.user.role
    }
  })
})

// Update admin account info
router.put('/account', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { username } = req.body

    if (!username) {
      return res.status(400).json({ message: '用户名不能为空' })
    }

    const success = updateAdmin({ username })

    if (success) {
      res.json({ message: '账户信息更新成功' })
    } else {
      res.status(500).json({ message: '账户信息更新失败' })
    }
  } catch (err) {
    console.error('Update account error:', err)
    res.status(500).json({ message: '账户信息更新失败，请稍后重试' })
  }
})

// Update admin password
router.put('/password', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: '请输入当前密码和新密码' })
    }

    // Validate new password
    if (newPassword.length < 8) {
      return res.status(400).json({ message: '密码长度不少于8位' })
    }

    if (!/[A-Z]/.test(newPassword)) {
      return res.status(400).json({ message: '密码必须包含大写字母' })
    }

    if (!/[a-z]/.test(newPassword)) {
      return res.status(400).json({ message: '密码必须包含小写字母' })
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword)) {
      return res.status(400).json({ message: '密码必须包含特殊符号' })
    }

    const result = await updatePassword(currentPassword, newPassword)

    if (result.success) {
      res.json({ message: result.message })
    } else {
      res.status(400).json({ message: result.message })
    }
  } catch (err) {
    console.error('Update password error:', err)
    res.status(500).json({ message: '密码更新失败，请稍后重试' })
  }
})

export default router
