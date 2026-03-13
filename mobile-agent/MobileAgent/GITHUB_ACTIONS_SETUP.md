# GitHub Actions 自动构建配置

配置完成后，每次 push 代码到 GitHub 都会自动构建 APK。

---

## 🚀 快速开始

### 1. 创建 GitHub 仓库

```bash
cd /Users/ouyansufen/.openclaw/workspace-coder/mobile-agent/MobileAgent

# 初始化 git
git init
git add .
git commit -m "Initial commit"

# 创建 GitHub 仓库并推送
gh repo create mobile-agent --public --source=. --push
```

或者手动：
1. 在 GitHub 创建新仓库
2. 复制仓库地址
3. `git remote add origin https://github.com/YOUR_USERNAME/mobile-agent.git`
4. `git push -u origin main`

### 2. 配置 Secrets（签名密钥）

**可选**：如果不配置，会构建 debug 版本 APK。

#### 生成签名密钥

```bash
cd android/app
keytool -genkey -v -keystore my-release-key.keystore -alias mobile-agent -keyalg RSA -keysize 2048 -validity 10000
# 记住输入的密码
```

#### 转换为 Base64

```bash
base64 my-release-key.keystore | pbcopy
# 复制到剪贴板
```

#### 添加到 GitHub Secrets

在 GitHub 仓库页面：
1. Settings → Secrets and variables → Actions
2. 添加以下 secrets：

| Secret 名称 | 值 |
|------------|-----|
| `ANDROID_KEYSTORE_BASE64` | Base64 编码的 keystore 文件 |
| `ANDROID_KEYSTORE_PASSWORD` | Keystore 密码 |
| `ANDROID_KEY_ALIAS` | 别名 (如: mobile-agent) |
| `ANDROID_KEY_PASSWORD` | 密钥密码 |

### 3. 触发构建

Push 代码到 main 分支：

```bash
git add .
git commit -m "Add GitHub Actions"
git push origin main
```

---

## 📦 获取 APK

### 方式 1：Artifacts（每次构建）

1. 打开 GitHub 仓库
2. 点击 Actions 标签
3. 选择最新的 workflow 运行
4. 在 Artifacts 部分下载 APK

### 方式 2：Releases（推荐）

1. 打开 GitHub 仓库
2. 点击 Releases 标签
3. 下载最新的 release APK

### 方式 3：手动触发

1. Actions 标签 → Build Mobile Agent APK
2. Run workflow
3. 选择 build_type (debug/release)

---

## 🔧 高级配置

### 修改构建触发条件

编辑 `.github/workflows/build-apk.yml`：

```yaml
on:
  push:
    branches: [ main ]
    # 只在特定文件变更时触发
    paths:
      - 'src/**'
      - 'App.js'
  # 定时构建（每天凌晨2点）
  schedule:
    - cron: '0 2 * * *'
```

### 多版本构建

```yaml
strategy:
  matrix:
    api-level: [29, 30, 31, 32, 33]
```

### 通知构建结果

添加步骤：

```yaml
- name: Notify
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    text: 'Mobile Agent 构建完成!'
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

---

## 🐛 故障排除

### 构建失败：找不到 gradlew

确保文件已提交：

```bash
git add android/gradlew
git add android/gradle/wrapper/
git commit -m "Add gradle wrapper"
git push
```

### 构建失败：内存不足

添加配置：

```yaml
- name: Build APK
  run: cd android && ./gradlew assembleRelease --no-daemon --max-workers=2
  env:
    JAVA_OPTS: "-Xmx4g"
    GRADLE_OPTS: "-Xmx4g"
```

### 签名失败

检查 secrets 是否正确设置：
- 大小写敏感
- 无多余空格
- Base64 完整（包含所有字符）

---

## 📊 构建状态

在 README.md 添加构建状态徽章：

```markdown
[![Build APK](https://github.com/YOUR_USERNAME/mobile-agent/actions/workflows/build-apk.yml/badge.svg)](https://github.com/YOUR_USERNAME/mobile-agent/actions/workflows/build-apk.yml)
```

---

## 💡 最佳实践

1. **保护主分支**：开启分支保护，要求 PR 审查
2. **版本管理**：使用语义化版本 (v1.0.0)
3. **发布说明**：自动生成 changelog
4. **缓存优化**：利用 GitHub Actions 缓存加速构建

---

完成配置后，每次 push 代码都会自动构建 APK！🎉
