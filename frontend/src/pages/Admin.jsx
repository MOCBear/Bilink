import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import { getAutoIcon, getAllIcons } from '../utils/iconLibrary'
import './Admin.css'

function Admin() {
  const { user, isAdmin, loading: authLoading, logout } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState({
    name: '',
    title: '',
    bio: '',
    avatar: '',
    about: '',
    skills: [],
    projects: [],
    links: [],
    contact: { email: '', location: '' }
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [activeTab, setActiveTab] = useState('basic')
  
  // 账户管理状态
  const [account, setAccount] = useState({
    username: user?.username || '',
    role: user?.role || ''
  })
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [passwordErrors, setPasswordErrors] = useState({})
  const [updatingPassword, setUpdatingPassword] = useState(false)
  
  // 图标选择状态
  const [showIconSelector, setShowIconSelector] = useState(false)
  const [selectedSkillIndex, setSelectedSkillIndex] = useState(null)
  const [allIcons, setAllIcons] = useState(getAllIcons())
  const [filteredIcons, setFilteredIcons] = useState(getAllIcons())
  const [searchIcons, setSearchIcons] = useState('')
  
  // 图标搜索过滤
  useEffect(() => {
    if (!searchIcons.trim()) {
      setFilteredIcons(allIcons)
      return
    }
    
    // 由于图标是字符，我们搜索图标对应的Unicode名称或关键字
    // 这里我们使用一个简单的过滤方法，实际可以根据需求扩展
    const searchTerm = searchIcons.toLowerCase().trim()
    setFilteredIcons(allIcons)
  }, [searchIcons, allIcons])

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/login')
    }
  }, [authLoading, isAdmin, navigate])

  useEffect(() => {
    if (isAdmin) {
      fetchProfile()
    }
  }, [isAdmin])

  const fetchProfile = async () => {
    try {
      const res = await axios.get('/api/profile')
      setProfile(res.data)
    } catch (err) {
      console.error('Failed to fetch profile:', err)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage({ type: '', text: '' })
    
    try {
      await axios.put('/api/profile', profile)
      setMessage({ type: 'success', text: '保存成功！' })
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (err) {
      setMessage({ type: 'error', text: '保存失败，请重试' })
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  /**
   * 验证密码复杂度
   * 
   * 检查密码是否符合安全要求：长度不少于8位、包含大小写字母及特殊符号
   * 
   * @param {string} password - 要验证的密码
   * @returns {Object} 错误信息对象
   */
  const validatePassword = (password) => {
    const errors = {}
    
    if (password.length < 8) {
      errors.length = '密码长度不少于8位'
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.uppercase = '密码必须包含大写字母'
    }
    
    if (!/[a-z]/.test(password)) {
      errors.lowercase = '密码必须包含小写字母'
    }
    
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.special = '密码必须包含特殊符号'
    }
    
    return errors
  }

  /**
   * 处理密码更新
   * 
   * 验证密码复杂度，确认新密码和确认密码是否一致，然后提交更新
   */
  const handleUpdatePassword = async () => {
    // 验证密码
    const newPasswordErrors = validatePassword(passwordForm.newPassword)
    
    if (Object.keys(newPasswordErrors).length > 0) {
      setPasswordErrors(newPasswordErrors)
      return
    }
    
    // 验证确认密码
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordErrors(prev => ({ ...prev, confirm: '新密码和确认密码不一致' }))
      return
    }
    
    setPasswordErrors({})
    setUpdatingPassword(true)
    setMessage({ type: '', text: '' })
    
    try {
      // 调用后端API更新密码
      const response = await axios.put('/api/auth/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      })
      
      setMessage({ type: 'success', text: response.data.message })
      
      // 重置表单
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.message || '密码更新失败，请重试' 
      })
    } finally {
      setUpdatingPassword(false)
    }
  }

  /**
   * 处理账户信息更新
   * 
   * 更新用户名等账户信息
   */
  const handleUpdateAccount = async () => {
    setSaving(true)
    setMessage({ type: '', text: '' })
    
    try {
      // 调用后端API更新账户信息
      const response = await axios.put('/api/auth/account', {
        username: account.username
      })
      
      setMessage({ type: 'success', text: response.data.message })
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.message || '账户信息更新失败，请重试' 
      })
    } finally {
      setSaving(false)
    }
  }

  const addSkill = () => {
    setProfile(prev => ({
      ...prev,
      skills: [...prev.skills, { name: '', icon: '�', level: 80 }]
    }))
  }

  const updateSkill = (index, field, value) => {
    const newSkills = [...profile.skills]
    newSkills[index][field] = value
    
    // 当技能名称改变时，自动匹配图标
    if (field === 'name') {
      const autoIcon = getAutoIcon(value)
      newSkills[index].icon = autoIcon
    }
    
    setProfile(prev => ({ ...prev, skills: newSkills }))
  }

  const removeSkill = (index) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }))
  }

  const addProject = () => {
    setProfile(prev => ({
      ...prev,
      projects: [...prev.projects, { title: '', description: '', url: '', image: '', tags: [] }]
    }))
  }

  const updateProject = (index, field, value) => {
    const newProjects = [...profile.projects]
    newProjects[index][field] = value
    setProfile(prev => ({ ...prev, projects: newProjects }))
  }

  const removeProject = (index) => {
    setProfile(prev => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index)
    }))
  }

  const addLink = () => {
    setProfile(prev => ({
      ...prev,
      links: [...prev.links, { type: 'website', label: '', url: '' }]
    }))
  }

  const updateLink = (index, field, value) => {
    const newLinks = [...profile.links]
    newLinks[index][field] = value
    setProfile(prev => ({ ...prev, links: newLinks }))
  }

  const removeLink = (index) => {
    setProfile(prev => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== index)
    }))
  }

  if (authLoading) {
    return (
      <div className="admin-page">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="loading-container">
          <div className="spinner-large"></div>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  const tabs = [
    { id: 'basic', label: '基本信息', icon: '👤' },
    { id: 'skills', label: '技能专长', icon: '🚀' },
    { id: 'projects', label: '项目作品', icon: '💼' },
    { id: 'links', label: '社交链接', icon: '🔗' },
    { id: 'contact', label: '联系方式', icon: '📬' },
    { id: 'account', label: '账户管理', icon: '🔐' }
  ]

  return (
    <div className="admin-page">
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      <div className="orb orb-3"></div>

      <div className="container">
        {/* Header */}
        <header className="admin-header">
          <div className="glass-card header-card">
            <div className="header-left">
              <h1 className="title-gradient">控制面板</h1>
              <p className="header-subtitle">管理您的个人主页内容</p>
            </div>
            <div className="header-right">
              <span className="admin-badge">
                <span className="badge-icon">👑</span>
                {user?.username}
              </span>
              <button onClick={handleLogout} className="glass-btn logout-btn">
                退出登录
              </button>
            </div>
          </div>
        </header>

        {/* Message Toast */}
        {message.text && (
          <div className={`toast toast-${message.type}`}>
            {message.type === 'success' ? '✅' : '❌'} {message.text}
          </div>
        )}

        {/* Tab Navigation */}
        <nav className="admin-nav">
          <div className="glass-card nav-card">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="tab-icon">{tab.icon}</span>
                <span className="tab-label">{tab.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Content Area */}
        <main className="admin-content">
          {/* Basic Info Tab */}
          {activeTab === 'basic' && (
            <div className="glass-card content-card">
              <h2 className="card-title">基本信息</h2>
              
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">姓名</label>
                  <input
                    type="text"
                    className="glass-input"
                    placeholder="您的名字"
                    value={profile.name}
                    onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">头衔</label>
                  <input
                    type="text"
                    className="glass-input"
                    placeholder="例如：全栈开发工程师"
                    value={profile.title}
                    onChange={(e) => setProfile(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>

                <div className="form-group full-width">
                  <label className="form-label">头像URL</label>
                  <input
                    type="url"
                    className="glass-input"
                    placeholder="https://example.com/avatar.jpg"
                    value={profile.avatar}
                    onChange={(e) => setProfile(prev => ({ ...prev, avatar: e.target.value }))}
                  />
                </div>

                <div className="form-group full-width">
                  <label className="form-label">简短介绍</label>
                  <input
                    type="text"
                    className="glass-input"
                    placeholder="一句话介绍自己"
                    value={profile.bio}
                    onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                  />
                </div>

                <div className="form-group full-width">
                  <label className="form-label">关于我</label>
                  <textarea
                    className="glass-textarea"
                    placeholder="详细介绍自己..."
                    value={profile.about}
                    onChange={(e) => setProfile(prev => ({ ...prev, about: e.target.value }))}
                    rows={5}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Skills Tab */}
          {activeTab === 'skills' && (
            <div className="glass-card content-card">
              <div className="card-header">
                <h2 className="card-title">技能专长</h2>
                <button onClick={addSkill} className="glass-btn add-btn">
                  <span>+</span> 添加技能
                </button>
              </div>

              <div className="items-list">
                {profile.skills.map((skill, index) => (
                  <div key={index} className="item-row glass-card">
                    <div className="item-fields">
                      <div className="icon-input-container">
                        <input
                          type="text"
                          className="glass-input icon-input"
                          placeholder="图标"
                          value={skill.icon}
                          onChange={(e) => updateSkill(index, 'icon', e.target.value)}
                        />
                        <button 
                          className="icon-select-btn"
                          onClick={() => {
                            setSelectedSkillIndex(index)
                            setShowIconSelector(true)
                          }}
                        >
                          🎨
                        </button>
                      </div>
                      <input
                        type="text"
                        className="glass-input"
                        placeholder="技能名称"
                        value={skill.name}
                        onChange={(e) => updateSkill(index, 'name', e.target.value)}
                      />
                      <input
                        type="number"
                        className="glass-input level-input"
                        placeholder="熟练度"
                        min="0"
                        max="100"
                        value={skill.level}
                        onChange={(e) => updateSkill(index, 'level', parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <button onClick={() => removeSkill(index)} className="remove-btn">
                      ✕
                    </button>
                  </div>
                ))}
                {profile.skills.length === 0 && (
                  <p className="empty-text">暂无技能，点击上方按钮添加</p>
                )}
              </div>
              
              {/* 图标选择器 */}
              {showIconSelector && (
                <div className="icon-selector-overlay" onClick={() => setShowIconSelector(false)}>
                  <div className="icon-selector glass-card" onClick={(e) => e.stopPropagation()}>
                    <div className="icon-selector-header">
                      <h3>选择图标</h3>
                      <button 
                        className="close-btn"
                        onClick={() => setShowIconSelector(false)}
                      >
                        ✕
                      </button>
                    </div>
                    <div className="icon-selector-search">
                      <input
                        type="text"
                        className="glass-input"
                        placeholder="搜索图标..."
                        value={searchIcons}
                        onChange={(e) => setSearchIcons(e.target.value)}
                      />
                    </div>
                    <div className="icon-grid">
                      {filteredIcons.map((icon, idx) => (
                        <button
                          key={idx}
                          className="icon-item"
                          onClick={() => {
                            updateSkill(selectedSkillIndex, 'icon', icon)
                            setShowIconSelector(false)
                            setSearchIcons('')
                          }}
                          title={`选择图标: ${icon}`}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                    {filteredIcons.length === 0 && (
                      <p className="no-icons">没有找到匹配的图标</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Projects Tab */}
          {activeTab === 'projects' && (
            <div className="glass-card content-card">
              <div className="card-header">
                <h2 className="card-title">项目作品</h2>
                <button onClick={addProject} className="glass-btn add-btn">
                  <span>+</span> 添加项目
                </button>
              </div>

              <div className="items-list">
                {profile.projects.map((project, index) => (
                  <div key={index} className="project-item glass-card">
                    <div className="project-fields">
                      <div className="form-group">
                        <label className="form-label">项目名称</label>
                        <input
                          type="text"
                          className="glass-input"
                          placeholder="项目名称"
                          value={project.title}
                          onChange={(e) => updateProject(index, 'title', e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">项目链接</label>
                        <input
                          type="url"
                          className="glass-input"
                          placeholder="https://..."
                          value={project.url}
                          onChange={(e) => updateProject(index, 'url', e.target.value)}
                        />
                      </div>
                      <div className="form-group full-width">
                        <label className="form-label">项目描述</label>
                        <textarea
                          className="glass-textarea"
                          placeholder="项目简介..."
                          value={project.description}
                          onChange={(e) => updateProject(index, 'description', e.target.value)}
                          rows={2}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">封面图片URL</label>
                        <input
                          type="url"
                          className="glass-input"
                          placeholder="https://..."
                          value={project.image}
                          onChange={(e) => updateProject(index, 'image', e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">标签（逗号分隔）</label>
                        <input
                          type="text"
                          className="glass-input"
                          placeholder="React, Node.js"
                          value={project.tags?.join(', ') || ''}
                          onChange={(e) => updateProject(index, 'tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
                        />
                      </div>
                    </div>
                    <button onClick={() => removeProject(index)} className="remove-btn project-remove">
                      ✕
                    </button>
                  </div>
                ))}
                {profile.projects.length === 0 && (
                  <p className="empty-text">暂无项目，点击上方按钮添加</p>
                )}
              </div>
            </div>
          )}

          {/* Links Tab */}
          {activeTab === 'links' && (
            <div className="glass-card content-card">
              <div className="card-header">
                <h2 className="card-title">社交链接</h2>
                <button onClick={addLink} className="glass-btn add-btn">
                  <span>+</span> 添加链接
                </button>
              </div>

              <div className="items-list">
                {profile.links.map((link, index) => (
                  <div key={index} className="item-row glass-card">
                    <div className="item-fields">
                      <select
                        className="glass-input type-select"
                        value={link.type}
                        onChange={(e) => updateLink(index, 'type', e.target.value)}
                      >
                        <option value="github">GitHub</option>
                        <option value="twitter">Twitter</option>
                        <option value="linkedin">LinkedIn</option>
                        <option value="instagram">Instagram</option>
                        <option value="youtube">YouTube</option>
                        <option value="blog">博客</option>
                        <option value="website">网站</option>
                        <option value="email">邮箱</option>
                      </select>
                      <input
                        type="text"
                        className="glass-input"
                        placeholder="显示名称"
                        value={link.label}
                        onChange={(e) => updateLink(index, 'label', e.target.value)}
                      />
                      <input
                        type="url"
                        className="glass-input url-input"
                        placeholder="链接地址"
                        value={link.url}
                        onChange={(e) => updateLink(index, 'url', e.target.value)}
                      />
                    </div>
                    <button onClick={() => removeLink(index)} className="remove-btn">
                      ✕
                    </button>
                  </div>
                ))}
                {profile.links.length === 0 && (
                  <p className="empty-text">暂无链接，点击上方按钮添加</p>
                )}
              </div>
            </div>
          )}

          {/* Contact Tab */}
          {activeTab === 'contact' && (
            <div className="glass-card content-card">
              <h2 className="card-title">联系方式</h2>
              
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">电子邮箱</label>
                  <input
                    type="email"
                    className="glass-input"
                    placeholder="your@email.com"
                    value={profile.contact?.email || ''}
                    onChange={(e) => setProfile(prev => ({
                      ...prev,
                      contact: { ...prev.contact, email: e.target.value }
                    }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">所在地</label>
                  <input
                    type="text"
                    className="glass-input"
                    placeholder="城市, 国家"
                    value={profile.contact?.location || ''}
                    onChange={(e) => setProfile(prev => ({
                      ...prev,
                      contact: { ...prev.contact, location: e.target.value }
                    }))}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Account Management Tab */}
          {activeTab === 'account' && (
            <div className="glass-card content-card">
              <h2 className="card-title">账户管理</h2>
              
              {/* Account Information Section */}
              <div className="account-section">
                <h3 className="section-subtitle">账户信息</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">用户名</label>
                    <input
                      type="text"
                      className="glass-input"
                      placeholder="用户名"
                      value={account.username}
                      onChange={(e) => setAccount(prev => ({ ...prev, username: e.target.value }))}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">角色</label>
                    <input
                      type="text"
                      className="glass-input"
                      placeholder="角色"
                      value={account.role}
                      disabled
                    />
                  </div>
                </div>
                
                <button 
                  onClick={handleUpdateAccount} 
                  className="glass-btn glass-btn-primary account-btn"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="spinner"></span>
                      更新中...
                    </>
                  ) : (
                    <>
                      <span>🔄</span>
                      更新账户信息
                    </>
                  )}
                </button>
              </div>

              {/* Password Reset Section */}
              <div className="password-section">
                <h3 className="section-subtitle">密码重置</h3>
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label className="form-label">当前密码</label>
                    <input
                      type="password"
                      className="glass-input"
                      placeholder="请输入当前密码"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                    />
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label">新密码</label>
                    <input
                      type="password"
                      className="glass-input"
                      placeholder="请输入新密码"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                    />
                    {passwordErrors.length && (
                      <p className="error-message">{passwordErrors.length}</p>
                    )}
                    {passwordErrors.uppercase && (
                      <p className="error-message">{passwordErrors.uppercase}</p>
                    )}
                    {passwordErrors.lowercase && (
                      <p className="error-message">{passwordErrors.lowercase}</p>
                    )}
                    {passwordErrors.special && (
                      <p className="error-message">{passwordErrors.special}</p>
                    )}
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label">确认密码</label>
                    <input
                      type="password"
                      className="glass-input"
                      placeholder="请再次输入新密码"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    />
                    {passwordErrors.confirm && (
                      <p className="error-message">{passwordErrors.confirm}</p>
                    )}
                  </div>
                </div>
                
                <div className="password-requirements">
                  <h4>密码要求：</h4>
                  <ul>
                    <li>长度不少于8位</li>
                    <li>包含大写字母</li>
                    <li>包含小写字母</li>
                    <li>包含特殊符号</li>
                  </ul>
                </div>
                
                <button 
                  onClick={handleUpdatePassword} 
                  className="glass-btn glass-btn-primary password-btn"
                  disabled={updatingPassword}
                >
                  {updatingPassword ? (
                    <>
                      <span className="spinner"></span>
                      更新中...
                    </>
                  ) : (
                    <>
                      <span>🔒</span>
                      更新密码
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </main>

        {/* Save Button */}
        <div className="save-area">
          <button 
            onClick={handleSave} 
            className="glass-btn glass-btn-primary save-btn"
            disabled={saving}
          >
            {saving ? (
              <>
                <span className="spinner"></span>
                保存中...
              </>
            ) : (
              <>
                <span>💾</span>
                保存更改
              </>
            )}
          </button>
          <a href="/" target="_blank" className="glass-btn preview-btn">
            <span>👁️</span>
            预览主页
          </a>
        </div>
      </div>
    </div>
  )
}

export default Admin
