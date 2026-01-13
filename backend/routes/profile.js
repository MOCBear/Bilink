import express from 'express'
import { getProfile, updateProfile } from '../data/store.js'
import { authMiddleware, adminOnly } from '../middleware/auth.js'

const router = express.Router()

// Get profile (public)
router.get('/', (req, res) => {
  try {
    const profile = getProfile()
    res.json(profile)
  } catch (err) {
    console.error('Get profile error:', err)
    res.status(500).json({ message: '获取数据失败' })
  }
})

// Update profile (admin only)
router.put('/', authMiddleware, adminOnly, (req, res) => {
  try {
    const profileData = req.body
    
    // Validate required fields
    if (!profileData.name) {
      return res.status(400).json({ message: '姓名不能为空' })
    }

    const success = updateProfile(profileData)
    
    if (success) {
      res.json({ message: '保存成功', profile: getProfile() })
    } else {
      res.status(500).json({ message: '保存失败' })
    }
  } catch (err) {
    console.error('Update profile error:', err)
    res.status(500).json({ message: '保存失败，请稍后重试' })
  }
})

export default router
