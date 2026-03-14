# 写给你的信 - H5 版本

一个温馨的信件应用，可以写给重要的人，支持分享功能。

## ✨ 功能特性

- 💌 **写信**：选择封面样式，写下心意
- 📬 **看信**：3D 信封开启动画，温馨体验
- 🔗 **分享**：信件数据编码到 URL，分享后对方可直接查看
- 💾 **本地存储**：使用 localStorage 保存信件
- 📱 **响应式设计**：适配手机和电脑

## 📁 文件结构

```
loveletters-h5/
├── index.html    # 主页面
├── app.js        # 应用逻辑
└── README.md     # 项目说明
```

## 🚀 部署到 GitHub Pages

### 步骤 1：创建 GitHub 仓库

1. 打开 [github.com](https://github.com)，登录你的账号
2. 点击右上角 **+** → **New repository**
3. 填写仓库信息：
   - **Repository name**: `letter-to-you`（或你喜欢的名字）
   - **Description**: 写给你的信 - H5版本
   - 选择 **Public**（公开仓库才能免费使用 Pages）
   - 勾选 **Add a README file**
4. 点击 **Create repository**

### 步骤 2：上传文件

在仓库页面：
1. 点击 **Add file** → **Upload files**
2. 上传这两个文件：
   - `index.html`
   - `app.js`
3. 点击 **Commit changes**

### 步骤 3：开启 GitHub Pages

1. 在仓库页面，点击 **Settings**（顶部标签）
2. 左侧菜单找到 **Pages**
3. **Source** 部分选择 **Deploy from a branch**
4. **Branch** 选择 **main**（或 master），文件夹选 **/(root)**
5. 点击 **Save**

### 步骤 4：等待部署完成

- 等待 1-2 分钟
- 刷新页面，会显示你的访问链接：
  ```
  https://你的用户名.github.io/letter-to-you/
  ```
- 点击链接即可访问

## 📤 分享给朋友

1. 打开应用，写一封信
2. 点击"分享"按钮复制链接
3. 把链接发给朋友
4. 朋友打开链接后，**无需登录，直接就能看到完整的信件内容！**

分享链接示例：
```
https://你的用户名.github.io/letter-to-you/?letter=eyJ0Ijoi...（编码后的数据）
```

## 💡 技术说明

- 分享链接包含完整的信件数据（Base64 编码）
- 数据存储在浏览器 localStorage 中
- 不同设备访问数据不互通（除非使用分享链接）

## 📝 更新日志

### v1.0.0
- 初始版本发布
- 支持写信、看信、分享功能
- 5 种信封封面样式
- 3D 信封开启动画

## 💝 致谢

感谢使用「写给你的信」，希望这份温暖能传递给重要的人。
