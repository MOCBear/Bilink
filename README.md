# Bilink 个人交互主页系统

Bilink 是一款采用现代化液态玻璃视觉效果的个人交互主页系统，支持前后端分离架构，提供美观且功能完整的个人展示平台，包含访客浏览和管理员管理双重角色权限。注意吼：只是一个摸鱼写的项目，存在诸多BUG等你去发现。

## 核心特性

- **视觉设计**：集成 iOS 26 风格的液态玻璃（Glassmorphism）效果，扁平化现代设计
- **功能模块**：支持个人信息、技能、项目、社交链接展示与管理
- **权限管理**：区分访客 / 管理员角色，JWT 认证保障管理后台安全
- **响应式布局**：适配手机、平板、桌面等多设备尺寸
- **便捷管理**：管理员可通过控制面板一编辑所有展示内容（三击底部版权信息将会得到登录按钮）

## 注释说明

#### 前端代码注释示例

```javascript
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

  // 其他代码...
}
```

####  后端代码注释示例

```javascript
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
```


## 技术栈

### 前端

- React 18 + React Router DOM 6
- Vite 6 构建工具
- Axios 网络请求
- CSS3 液态玻璃样式实现

### 后端

- Node.js 24 + Express 4
- JWT 身份认证
- bcryptjs 密码加密
- JSON 文件数据存储

## 快速开始

### 环境要求

- Node.js ^24.11.1
- npm ^10.0.0

### 安装部署

```bash
# 克隆项目
git clone https://github.com/MOCBear/bilink.git
cd bilink

# 安装后端依赖
cd backend
npm install
cp .env.example .env

# 安装前端依赖
cd ../frontend
npm install

# 启动后端（开发模式）
cd ../backend
npm run dev

# 启动前端（新终端）
cd frontend
npm run dev
```

### 访问应用

- 前端页面：http://localhost:3000
- 后端 API：http://localhost:5000
- 健康检查：http://localhost:5000/api/health

## 使用指南

### 访客使用

直接访问主页即可浏览个人信息、技能、项目等内容，点击社交链接可跳转至对应平台。

### 管理员登录

1. 在主页任意位置点击 3 次触发登录按钮
2. 使用默认账号（admin/admin123）登录管理后台
3. 登录后可编辑个人信息、技能、项目等所有内容
4. 首次登录建议修改默认密码保障安全

## 生产部署

1. 前端构建：`cd frontend && npm run build`，将 dist 目录部署至静态服务器
2. 后端部署：配置环境变量（修改 JWT_SECRET），使用 PM2 守护进程
3. 生产环境建议配置 CORS 白名单，限制前端访问域名

## 常见问题

- **登录按钮不显示**：确保主页点击满 3 次，检查浏览器控制台无 JS 错误
- **液态玻璃效果异常**：使用 Chrome/Firefox/Edge 现代浏览器（需支持 backdrop-filter）
- **忘记管理员密码**：删除 backend/data/data.json 后重启后端，恢复默认密码
- **端口被占用**：修改 backend/.env 中的 PORT 或前端 vite.config.js 端口配置

## Feather

1.无法通过控制面板正确的修改密码，如需修改，直接删data.json，然后去backend/.env 里面修改。改完记得重启，然后你将得到一个可以用新密码登录的账户。

2.标签页名称更新问题，似乎影响不大，暂时就不改了。

3.独立账户信息保存文件并进行加密，后期会增加一些模块，并将模块分类，或许会加一个小数据库？

4.后端api其实并不完整，不过我会慢慢补充的，如果想起来的话？！

5.液态玻璃效果会继续优化，增加背景更换能力，这版就这些咯。

## 许可证

本项目基于 MIT 许可证开源，可自由使用、修改和分发。

### 贡献

如果您希望为项目做出贡献，欢迎提交 Pull Request 或 Issue。所有贡献将被视为在 MIT 许可证下发布。
