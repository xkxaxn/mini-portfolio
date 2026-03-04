# mini Portfolio

**mini Portfolio** 是一个轻量级个人作品集展示与管理平台。它不仅是一个优雅的简历展示页面，更内置了全可视化的内容管理后台（CMS），让您无需编写代码即可轻松管理项目经历、技能树及联系方式。

---

## ✨ 核心特性 (Features)

### 🎨 现代化前台展示
- **优雅设计**：响应式布局，基于 Tailwind CSS 构建，完美适配手机、平板和桌面端。
- **多视图切换**：支持卡片 (Grid) 和列表 (List) 两种展示模式。
- **交互体验**：内置图片轮播、项目详情弹窗及平滑过渡动画。

### 🛠 可视化后台管理
- **所见即所得**：全表单化编辑，告别繁琐的 JSON 手写修改。
- **动态配置**：支持无限添加自定义联系方式（如 GitHub, Bilibili 等）与技能分类。
- **数据安全**：内置导入/导出及一键备份功能，支持操作回滚。
- **体验优化**：支持管理员免登录状态保持，所有操作均有实时反馈。

---

## 🛠️ 技术栈 (Tech Stack)

本项目基于现代化的全栈技术构建：

- **前端**: React 18, React Router v7, Tailwind CSS v4, Lucide React
- **构建工具**: Vite
- **后端**: Node.js + Express (API & 静态托管)
- **数据存储**: JSON 文件 (轻量级，易迁移)

---

## 🚀 快速开发 (Development)

如果您想在本地进行开发或调试，请按照以下步骤操作。

### 1. 环境准备
确保您的环境已安装 **Node.js 20+**。

### 2. 安装依赖
```bash
npm install
```

### 3. 启动服务
您需要同时启动后端 API 和前端开发服务器：

```bash
# 终端 1: 启动后端 (运行在 http://localhost:3000)
node server.js

# 终端 2: 启动前端 (运行在 http://localhost:5173)
npm run dev
```
*注：开发模式下，前端 `/api` 请求会自动代理到后端 3000 端口。*

---

## 📦 生产环境部署 (Deployment)

本项目支持多种部署方式，您可以选择最适合您环境的方案。

### 方案一：使用 Docker 镜像（推荐）
这是最简单快捷的部署方式，无需配置本地开发环境。

1. **拉取镜像**
   ```bash
   docker pull xkxaxn/portfolio:latest
   ```

2. **启动容器**
   ```bash
   docker run -d --restart=always -p 3000:3000 --name portfolio_service xkxaxn/portfolio:latest
   ```
   - `-d`: 后台运行
   - `--restart=always`: 容器自动重启
   - `-p 3000:3000`: 端口映射

3. **访问应用**
   打开浏览器访问 `http://localhost:3000` 即可。

### 方案二：手动构建部署

1. **构建静态资源**
   ```bash
   npm run build
   ```

2. **启动生产服务器**
   ```bash
   node server.js
   ```

---

## � 使用说明 (Usage Guide)

1. **访问后台**：在浏览器中打开 `/edit`（例如 `http://localhost:3000/edit`）。
2. **管理员登录**：默认密码为 `123456`。
3. **内容管理**：登录后可直接编辑个人信息、项目经历等，点击保存即时生效。

---

## 📄 开源协议 (License)

本项目采用 [MIT License](https://opensource.org/licenses/MIT) 开源协议。

---

**If you like this project, please give it a ⭐️!**
**如果你喜欢这个项目，请给它一个 ⭐️！**
