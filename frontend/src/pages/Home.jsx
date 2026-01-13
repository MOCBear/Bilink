import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import './Home.css'

function Home() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [clickCount, setClickCount] = useState(0)
  const [showLogin, setShowLogin] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    fetchProfile()
  }, [])

  // 用于存储点击超时定时器
  const clickTimeoutRef = useRef(null)
  // 用于存储点击动画定时器
  const animationTimeoutRef = useRef(null)
  // 用于获取版权信息元素
  const copyrightRef = useRef(null)

  /**
   * 处理版权信息点击事件
   * 
   * 实现连续点击计数，3次点击后显示登录按钮
   * 两次点击间隔超过3秒则重置计数
   */
  const handleCopyrightClick = () => {
    // 清除之前的超时定时器
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current)
    }

    // 视觉反馈：添加点击动画
    if (copyrightRef.current) {
      copyrightRef.current.style.transform = 'scale(0.95)'
      copyrightRef.current.style.transition = 'transform 0.1s ease'
      
      // 清除之前的动画定时器
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current)
      }
      
      // 恢复原始大小
      animationTimeoutRef.current = setTimeout(() => {
        if (copyrightRef.current) {
          copyrightRef.current.style.transform = 'scale(1)'
        }
      }, 100)
    }

    // 更新点击计数
    setClickCount(prev => {
      const newCount = prev + 1
      if (newCount >= 3) {
        setShowLogin(true)
        return 0 // 重置计数，防止继续点击
      }
      return newCount
    })

    // 设置3秒超时定时器，超时后重置计数
    clickTimeoutRef.current = setTimeout(() => {
      setClickCount(0)
    }, 3000)
  }

  // 组件卸载时清除定时器
  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current)
      }
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current)
      }
    }
  }, [])

  // 添加防抖动的触摸事件监听器（用于移动端）
  useEffect(() => {
    const copyrightElement = copyrightRef.current
    if (!copyrightElement) return

    let lastTouchEnd = 0
    
    const handleTouchEnd = (e) => {
      const now = (new Date()).getTime()
      // 防抖动：忽略300ms内的连续触摸
      if (now - lastTouchEnd <= 300) {
        e.preventDefault()
        return
      }
      lastTouchEnd = now
      handleCopyrightClick()
    }

    // 添加触摸事件监听器
    copyrightElement.addEventListener('touchend', handleTouchEnd, { passive: false })

    return () => {
      copyrightElement.removeEventListener('touchend', handleTouchEnd)
    }
  }, [])

  const fetchProfile = async () => {
    try {
      const res = await axios.get('/api/profile')
      setProfile(res.data)
    } catch (err) {
      console.error('Failed to fetch profile:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
    <div className="home-page">
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      <div className="orb orb-3"></div>
      
      {/* Hidden login trigger - appears when clicking copyright text */}
      <div className={`login-trigger-container ${showLogin ? 'visible' : ''}`}>
        <button 
          className="login-trigger glass-btn"
          onClick={() => window.location.href = '/login'}
        >
          <span>🔐</span>
          管理员登录
        </button>
      </div>
      
      <div className="container">
          <div className="profile-skeleton">
            <div className="skeleton avatar-skeleton"></div>
            <div className="skeleton title-skeleton"></div>
            <div className="skeleton text-skeleton"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="home-page" ref={containerRef}>
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      <div className="orb orb-3"></div>
      
      {/* Login trigger - appears after 3 clicks on the page */}
      <div className={`login-trigger-container ${showLogin ? 'visible' : ''}`}>
        <button 
          className="login-trigger glass-btn"
          onClick={() => window.location.href = '/login'}
        >
          <span>🔐</span>
          管理员登录
        </button>
      </div>
      
      <div className="container">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="glass-card hero-card">
            <div className="hero-content">
              <div className="avatar-wrapper">
                <div className="avatar-ring"></div>
                <img 
                  src={profile?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'} 
                  alt="Avatar" 
                  className="avatar"
                />
                <div className="status-indicator"></div>
              </div>
              <h1 className="title-gradient hero-name">
                {profile?.name || 'Your Name'}
              </h1>
              <p className="hero-title">{profile?.title || 'Creative Developer'}</p>
              <p className="hero-bio">{profile?.bio || 'Welcome to my personal space.'}</p>
              
              <div className="social-links">
                {profile?.links?.map((link, index) => (
                  <a 
                    key={index} 
                    href={link.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="glass-btn social-btn"
                  >
                    <span className="social-icon">{getLinkIcon(link.type)}</span>
                    <span>{link.label}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        {profile?.about && (
          <section className="about-section">
            <div className="glass-card about-card">
              <h2 className="section-title">
                <span className="title-icon">✨</span>
                关于我
              </h2>
              <div className="about-content">
                <p>{profile.about}</p>
              </div>
            </div>
          </section>
        )}

        {/* Skills Section */}
        {profile?.skills?.length > 0 && (
          <section className="skills-section">
            <div className="glass-card skills-card">
              <h2 className="section-title">
                <span className="title-icon">🚀</span>
                技能专长
              </h2>
              <div className="skills-grid">
                {profile.skills.map((skill, index) => (
                  <div key={index} className="skill-item glass-card">
                    <span className="skill-icon">{skill.icon}</span>
                    <span className="skill-name">{skill.name}</span>
                    {skill.level && (
                      <div className="skill-bar">
                        <div 
                          className="skill-progress" 
                          style={{ width: `${skill.level}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Projects Section */}
        {profile?.projects?.length > 0 && (
          <section className="projects-section">
            <div className="glass-card projects-card">
              <h2 className="section-title">
                <span className="title-icon">💼</span>
                项目作品
              </h2>
              <div className="projects-grid">
                {profile.projects.map((project, index) => (
                  <a 
                    key={index} 
                    href={project.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="project-item glass-card"
                  >
                    {project.image && (
                      <div className="project-image">
                        <img src={project.image} alt={project.title} />
                      </div>
                    )}
                    <div className="project-info">
                      <h3 className="project-title">{project.title}</h3>
                      <p className="project-desc">{project.description}</p>
                      {project.tags && (
                        <div className="project-tags">
                          {project.tags.map((tag, i) => (
                            <span key={i} className="tag">{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Contact Section */}
        {profile?.contact && (
          <section className="contact-section">
            <div className="glass-card contact-card">
              <h2 className="section-title">
                <span className="title-icon">📬</span>
                联系我
              </h2>
              <div className="contact-info">
                {profile.contact.email && (
                  <a href={`mailto:${profile.contact.email}`} className="contact-item">
                    <span className="contact-icon">📧</span>
                    <span>{profile.contact.email}</span>
                  </a>
                )}
                {profile.contact.location && (
                  <div className="contact-item">
                    <span className="contact-icon">📍</span>
                    <span>{profile.contact.location}</span>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="footer">
          <div className="glass-card footer-card">
            <p 
              ref={copyrightRef}
              className="copyright-text" 
              onClick={handleCopyrightClick}
              style={{ cursor: 'pointer', transition: 'transform 0.1s ease' }}
            >
              © {new Date().getFullYear()} {profile?.name || 'Bilink'}. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}

function getLinkIcon(type) {
  const icons = {
    github: '🐱',
    twitter: '🐦',
    linkedin: '💼',
    instagram: '📷',
    youtube: '🎬',
    email: '📧',
    website: '🌐',
    blog: '📝',
    default: '🔗'
  }
  return icons[type?.toLowerCase()] || icons.default
}

export default Home
